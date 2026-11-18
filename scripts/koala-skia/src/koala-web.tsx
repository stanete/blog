/**
 * The koala on Koala's page: the app's own koala (src/components/koala.tsx and koala-art.tsx in
 * the koala repo), drawn in Skia. As on «Home»: it pops in and says hello, blinks and looks around
 * every few seconds, its eyes follow the pointer, and a click pokes it. From 22:00 to 7:00 by the visitor's clock its eyes are
 * shut (the page droops it and floats the z's); a click wakes it for the poke. With reduced motion
 * it is still. Belt: white, green as on the icon.
 */
import { Canvas, Group, vec } from '@shopify/react-native-skia';
import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Animated, { withDelay, withSequence, withTiming } from 'react-native-reanimated';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

import {
  FILL,
  greet,
  lookAt,
  poke,
  POKE_MS,
  useKoalaFace,
  useKoalaLife,
  useKoalaPose,
} from '@/components/koala';
import { KoalaArt } from '@/components/koala-art';

const SIZE = 96;
/** The white belt's green, as on the icon. */
const ACCENT = { light: '#34C759', dark: '#30D158' } as const;

const night = () => {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 7;
};
const darkQuery = matchMedia('(prefers-color-scheme: dark)');

function KoalaWeb({ koala }: { koala: HTMLElement }) {
  const [dark, setDark] = useState(darkQuery.matches);
  const [asleep, setAsleep] = useState(night);
  const face = useKoalaFace(0);
  const pose = useKoalaPose(reduced ? 1 : 0);
  const scheme = dark ? 'dark' : 'light';

  useEffect(() => {
    const change = () => setDark(darkQuery.matches);
    darkQuery.addEventListener('change', change);
    const clock = setInterval(() => setAsleep(night()), 60000);
    return () => {
      darkQuery.removeEventListener('change', change);
      clearInterval(clock);
    };
  }, []);

  // Says hello when the page opens, then, at night, nods off.
  useEffect(() => {
    if (!reduced) greet(pose, face);
  }, [pose, face]);
  // With reduced motion it is still: asleep, its eyes are just closed.
  useEffect(() => {
    face.lid.set(reduced ? (asleep ? 1 : 0) : withTiming(asleep ? 1 : 0, { duration: 700 }));
  }, [asleep, face]);
  useKoalaLife(face, !asleep);

  // A click pokes it, as a tap does in the app. Asleep, it wakes for it and nods off again.
  useEffect(() => {
    const onClick = () => {
      if (reduced) return;
      poke(pose, face);
      if (night()) {
        face.lid.set(
          withSequence(withTiming(0, { duration: 150 }), withDelay(POKE_MS, withTiming(1, { duration: 700 }))),
        );
      }
    };
    koala.addEventListener('click', onClick);
    return () => koala.removeEventListener('click', onClick);
  }, [koala, pose, face]);

  // Its eyes follow the pointer, the head a beat later, as when the phone tips in the app.
  useEffect(() => {
    if (reduced) return;
    let last = 0;
    const onMove = (event: PointerEvent) => {
      if (night() || event.timeStamp - last < 150) return;
      last = event.timeStamp;
      const box = koala.getBoundingClientRect();
      const toward = (by: number, reach: number) => Math.max(-1, Math.min(1, by / reach));
      lookAt(
        face,
        toward(event.clientX - (box.left + box.width / 2), innerWidth / 2),
        toward(event.clientY - (box.top + box.height / 2), innerHeight / 2),
      );
    };
    addEventListener('pointermove', onMove);
    return () => removeEventListener('pointermove', onMove);
  }, [koala, face]);

  const accent = useMemo(() => ACCENT[scheme], [scheme]);
  return (
    <Animated.View style={[{ width: SIZE, height: SIZE }, pose.style]}>
      <Canvas style={{ width: SIZE, height: SIZE }}>
        <Group transform={[{ scale: SIZE / 512 }]}>
          <Group transform={[{ scale: FILL }]} origin={vec(256, 256)}>
            <KoalaArt face={face} accent={accent} scheme={scheme} />
          </Group>
        </Group>
      </Canvas>
    </Animated.View>
  );
}

function mount(koala: HTMLElement) {
  const host = koala.querySelector<HTMLElement>('.koala-breath')!;
  const spot = document.createElement('div');
  spot.className = 'koala-skia';
  host.appendChild(spot);
  createRoot(spot).render(<KoalaWeb koala={koala} />);
  // The icon steps aside once the drawn koala is there.
  requestAnimationFrame(() => koala.classList.add('skia'));
}

const koala = document.querySelector<HTMLElement>('.koala[data-skia]');
if (koala) mount(koala);
