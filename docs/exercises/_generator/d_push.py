from lib import *
from reg import E, chain

GR = ('ground',)
BW = ['bodyweight']


def pu(Fx, Sy, hx=None, fy=G - 5, **kw):
    hx = sx(Fx, Sy, fy) if hx is None else hx
    return prone(Fx, Sy, (hx, G), fy=fy, **kw)


chain('push-up', ['wall-push-up', 'incline-push-up', 'knee-push-up', 'push-up', 'wide-push-up', 'diamond-push-up',
                  'decline-push-up', 'banded-push-up', 'archer-push-up', 'pseudo-planche-push-up', 'one-arm-push-up'])
chain('dip', ['dip-support-hold', 'band-assisted-dip', 'negative-dip', 'parallel-bar-dip'])
chain('pike-handstand', ['pike-push-up', 'wall-handstand-hold', 'wall-handstand-push-up'])

# ---- wall push-up
E('wall-push-up', 'Wall push-up', 'Pompe au mur', 'push', 'horizontal push', ['chest', 'triceps'], ['front delts', 'core'],
  BW, 1, 'reps', 'push-up',
  'Stand about one arm\'s length from a wall, palms on it at shoulder height, feet hip-width.',
  ['Brace your core so the body is one straight line.', 'Bend the elbows and bring your chest toward the wall.',
   'Keep elbows about 45° from the torso.', 'Press the wall away until the arms are straight.'],
  ['Hips sagging or poking back', 'Elbows flaring out wide', 'Only moving the head forward'],
  'Step your feet further back to make it harder before moving to the incline version.',
  dict(pose=prone(91, 152, (165, 152))), dict(pose=prone(91, 160, (165, 152))),
  scene=[GR, ('wall', 172, -1)])

# ---- incline
E('incline-push-up', 'Incline push-up', 'Pompe inclinée', 'push', 'horizontal push', ['chest', 'triceps'], ['front delts', 'core'],
  BW, 1, 'reps', 'push-up',
  'Hands on a sturdy raised surface (step, low bar or stairs), body in a straight diagonal line.',
  ['Squeeze glutes and abs; keep the body straight from head to heels.', 'Lower the chest to the edge, elbows ~45° from body.',
   'Press up until arms are straight.'],
  ['Hips dropping', 'Surface that slides or is unstable', 'Shrugging the shoulders to the ears'],
  'Lower the surface over weeks; the lower it is, the harder the push-up.',
  dict(pose=prone(36, 174, (109, G - 30))), dict(pose=prone(36, 204, (109, G - 30))),
  scene=[GR, ('step', 94, 130, G - 30)])

# ---- knee push-up
E('knee-push-up', 'Knee push-up', 'Pompe sur les genoux', 'push', 'horizontal push', ['chest', 'triceps'], ['front delts', 'core'],
  BW, 2, 'reps', 'push-up',
  'Kneel, hands under shoulders, body straight from knees to head, feet lifted.',
  ['Tighten abs and glutes so there is no bend at the hips.', 'Lower the chest to just above the floor.',
   'Press back up with straight line knees-hips-shoulders.'],
  ['Sitting the hips back toward the heels', 'Sagging lower back', 'Head dropping first'],
  'Pad the knees if the floor is hard. Move to full push-ups once you hit 3 x 12.',
  dict(pose=kneel_prone(40, 204, (40 + 57.7, G))),
  dict(pose=kneel_prone(40, 232, (40 + 57.7, G))), scene=[GR])

# ---- push-up
E('push-up', 'Push-up', 'Pompe', 'push', 'horizontal push', ['chest', 'triceps'], ['front delts', 'core', 'serratus'],
  BW, 2, 'reps', 'push-up',
  'Hands slightly wider than shoulders, arms straight, body in a plank from head to heels.',
  ['Squeeze glutes and abs; ribs down.', 'Lower the chest to a fist above the floor, elbows ~45° from the body.',
   'Press the floor away until the elbows lock out.'],
  ['Sagging hips or piking up', 'Flaring the elbows to 90°', 'Half reps; neck craned forward'],
  'Think of screwing your hands into the floor to keep the shoulders stable.',
  dict(pose=pu(28, 204, 121)), dict(pose=pu(28, 232, 121)), scene=[GR])

E('wide-push-up', 'Wide push-up', 'Pompe large', 'push', 'horizontal push', ['chest'], ['front delts', 'triceps', 'core'],
  BW, 3, 'reps', 'push-up',
  'Plank with hands clearly wider than shoulders (about 1.5x), fingers forward or slightly out.',
  ['Brace the body into a straight line.', 'Lower the chest between the hands with elbows out ~60-70°.',
   'Push up to full lockout.'],
  ['Elbows flared to 90°', 'Reduced depth', 'Hips sagging'],
  'Wider hands shift work to the chest and cut the range slightly; keep shoulder comfort first.',
  dict(pose=pu(28, 204, 121)), dict(pose=pu(28, 234, 121)), scene=[GR], note='side view: hands placed wider than shoulders')

E('diamond-push-up', 'Diamond push-up', 'Pompe diamant', 'push', 'horizontal push', ['triceps'], ['chest', 'front delts', 'core'],
  BW, 3, 'reps', 'push-up',
  'Plank with hands together under the chest, thumbs and index fingers forming a diamond.',
  ['Keep elbows tight to the sides.', 'Lower the chest toward the hands.', 'Extend fully, keeping the hips level.'],
  ['Elbows flaring', 'Wrists collapsing inward', 'Hips sagging'],
  'If the wrists complain, use narrow hands (not touching) or push-up bars.',
  dict(pose=pu(28, 204, 121)), dict(pose=pu(28, 235, 121)), scene=[GR], note='side view: hands together under the chest')

E('decline-push-up', 'Decline push-up', 'Pompe déclinée', 'push', 'horizontal push', ['chest', 'front delts'], ['triceps', 'core'],
  BW, 3, 'reps', 'push-up',
  'Feet on a stable raised surface (step or chair), hands on the floor under the shoulders.',
  ['Stay rigid from head to heels.', 'Lower the chest toward the floor, elbows ~45°.', 'Press up without letting the hips pike.'],
  ['Hips piking', 'Feet surface wobbling', 'Head dropping first'],
  'The higher the feet, the more it loads shoulders; keep it modest to start.',
  dict(pose=pu(28, 206, None, fy=G - 44)), dict(pose=pu(28, 230, sx(28,206,G-44), fy=G - 44)),
  scene=[GR, ('step', 6, 42, G - 40)])

E('banded-push-up', 'Banded push-up', 'Pompe avec élastique', 'push', 'horizontal push', ['chest', 'triceps'], ['front delts', 'core'],
  ['bodyweight', 'bands'], 3, 'reps', 'push-up',
  'Loop a band across your upper back and hold each end under your palms, then take a plank.',
  ['Keep the body straight as the band tightens.', 'Lower the chest with elbows ~45°.', 'Press hard to lockout where the band is tightest.'],
  ['Letting the band slip off a hand', 'Sagging hips', 'Cutting the range short'],
  'Use a heavier band to progress without changing leverage.',
  dict(pose=pu(28, 204, 121), over=[('band', (121, G - 2), 'shoulder', 0)]),
  dict(pose=pu(28, 232, 121), over=[('band', (121, G - 2), 'shoulder', 0)]), scene=[GR])

E('archer-push-up', 'Archer push-up', 'Pompe archer', 'push', 'horizontal push', ['chest', 'triceps'], ['front delts', 'core', 'obliques'],
  BW, 4, 'reps-per-side', 'push-up',
  'Wide plank, hands about twice shoulder width, fingers pointing slightly out.',
  ['Shift your weight toward one hand and bend that elbow.', 'Keep the opposite arm straight and press it into the floor.',
   'Lower the chest toward the bent-arm hand.', 'Press back to center; repeat to the other side.'],
  ['Rotating the hips', 'Straight arm bending', 'Dropping the chest unevenly'],
  'Use the straight arm as a kickstand and keep the movement slow.',
  dict(pose=pu(28, 204, 121)),
  dict(pose=pu(28, 232, 121, hand2=(sx(28, 232) + 36, G), ab2='b')), scene=[GR],
  note='far arm stays straight to the side; near arm does the work')

E('pseudo-planche-push-up', 'Pseudo planche push-up', 'Pompe pseudo planche', 'push', 'horizontal push',
  ['front delts', 'chest'], ['triceps', 'core', 'biceps (stabilise)'], BW, 4, 'reps', 'push-up',
  'Plank with hands by the lower ribs, fingers pointing back or out, shoulders well ahead of the hands.',
  ['Lean forward until the shoulders pass the hands.', 'Keep a hollow body: ribs down, glutes tight.',
   'Lower under control, elbows close to the body.', 'Press up while holding the lean.'],
  ['Losing the lean as you lower', 'Hips piking', 'Piking the shoulders to the ears'],
  'Build the wrist and bicep tolerance gradually; warm up the wrists first.',
  dict(pose=pu(24, 210, sx(24, 210) - 22, fl=5)), dict(pose=pu(24, 230, sx(24, 210) - 22)), scene=[GR])

E('one-arm-push-up', 'One-arm push-up', 'Pompe à un bras', 'push', 'horizontal push', ['chest', 'triceps'], ['front delts', 'core', 'obliques'],
  BW, 5, 'reps-per-side', 'push-up',
  'Wide feet, one hand under the chest, other hand resting behind your back.',
  ['Squeeze glutes, abs and legs to resist rotation.', 'Lower the chest toward the floor beside the working hand.',
   'Press up while keeping shoulders and hips level.'],
  ['Twisting open toward the free arm', 'Narrow foot stance', 'Skipping progressions'],
  'Work toward it with archers or by raising the working hand on a step.',
  dict(pose=pu(28, 204, 121, arm2=(185, 175))), dict(pose=pu(28, 232, 121, arm2=(185, 175))), scene=[GR],
  note='feet wide; free hand rests on lower back')

E('scapular-push-up', 'Scapular push-up', 'Pompe scapulaire', 'push', 'scapular control', ['serratus anterior'], ['chest', 'traps', 'core'],
  BW, 1, 'reps', 'push-scapular',
  'Plank with straight arms, hands under shoulders.',
  ['Keep elbows locked straight.', 'Let the chest sink slightly by squeezing the shoulder blades together.',
   'Push the floor away to spread the blades apart and round the upper back.'],
  ['Bending the elbows', 'Moving the hips', 'Rushing the reps'],
  'A small, slow movement; it teaches shoulder control for push-ups and handstands.',
  dict(pose=pu(28, 203, 121)), dict(pose=pu(28, 211, 121), arr=[(150, 180, 150, 202)]), scene=[GR])

# ---- dips
E('dip-support-hold', 'Dip support hold', 'Maintien en appui sur barres', 'push', 'vertical push', ['triceps', 'chest'], ['front delts', 'core', 'traps'],
  ['parallel-bars'], 2, 'time', 'dip',
  'Grip the parallel bars, jump or step to straight-arm support, legs slightly forward.',
  ['Lock the elbows and push the shoulders down away from the ears.', 'Keep the chest slightly forward and the core braced.',
   'Hold without swinging.'],
  ['Shrugging up into the ears', 'Bent elbows', 'Swinging legs'],
  'Build to 30 seconds before attempting dips.',
  dict(pose=support(100, 140, 96, lean=5)), None,
  scene=[GR, ('pbars', 66, 134, 140)])

E('band-assisted-dip', 'Band-assisted dip', 'Dips assistés (élastique)', 'push', 'vertical push', ['triceps', 'chest'], ['front delts', 'core'],
  ['parallel-bars', 'bands'], 2, 'reps', 'dip',
  'Stretch a band between the bars, knees resting on it, in straight-arm support.',
  ['Lower under control until the upper arms are about parallel to the floor.', 'Keep elbows close and chest slightly forward.',
   'Press up to full lockout.'],
  ['Bouncing off the band', 'Elbows flaring', 'Dropping too fast'],
  'Use thinner bands over time; slow lowering matters more than reps.',
  dict(pose=support(100, 140, 96, lean=6, foot=(88, 194)), over=[('band', (70, 146), 'knee', 6), ('band', 'knee', (130, 146), 6)]),
  dict(pose=support(100, 140, 130, lean=14, foot=(86, 214)), over=[('band', (70, 146), 'knee', 6), ('band', 'knee', (130, 146), 6)]),
  scene=[GR, ('pbars', 66, 134, 140)])

E('negative-dip', 'Negative dip', 'Dip négatif', 'push', 'vertical push', ['triceps', 'chest'], ['front delts', 'core'],
  ['parallel-bars'], 3, 'reps', 'dip',
  'Start in straight-arm support at the top of the bars.',
  ['Lower slowly for 3-5 seconds, chest slightly forward.', 'Stop when the upper arms are parallel to the floor.',
   'Step down or jump back to the top; repeat.'],
  ['Dropping in one fast motion', 'Shoulders rolling forward at the bottom', 'Elbows flaring'],
  'Stay in control; the slow lowering is the whole exercise.',
  dict(pose=support(100, 140, 96, lean=5)), dict(pose=support(100, 140, 130, lean=14, foot=(86, 214))),
  scene=[GR, ('pbars', 66, 134, 140)], endlabel='END (slow, 3-5 s)')

E('parallel-bar-dip', 'Parallel bar dip', 'Dips aux barres parallèles', 'push', 'vertical push', ['triceps', 'chest'], ['front delts', 'core'],
  ['parallel-bars'], 3, 'reps', 'dip',
  'Support yourself on the bars with straight arms, shoulders pulled down.',
  ['Lean the chest slightly forward and bend the elbows.', 'Lower until the upper arms are parallel with the floor.',
   'Press back to full lockout.'],
  ['Going too deep with shoulders rolled forward', 'Flared elbows', 'Swinging or kipping'],
  'Keep the shoulders away from the ears; stop short if the front of the shoulder hurts.',
  dict(pose=support(100, 140, 96, lean=5)), dict(pose=support(100, 140, 130, lean=14, foot=(86, 214))),
  scene=[GR, ('pbars', 66, 134, 140)])

# ---- pike / handstand
E('pike-push-up', 'Pike push-up', 'Pompe en pique', 'push', 'vertical push', ['front delts', 'triceps'], ['upper chest', 'core'],
  BW, 3, 'reps', 'pike-handstand',
  'From downward dog: hands shoulder-width, hips high, legs straight, head between the arms.',
  ['Bend the elbows and lower the top of the head toward the floor in front of the hands.', 'Keep the hips high throughout.',
   'Press back to the starting pike.'],
  ['Hips dropping into a push-up', 'Elbows flaring wide', 'Not reaching full depth'],
  'Walk the feet closer to the hands to make it harder.',
  dict(pose=dict(hip=(74, 196), t=40, hand=(142, G), ab='b', foot=(47, G - 5), fa=90, fl=5, hd=40)),
  dict(pose=dict(hip=(78, 194), t=55, hand=(142, G), ab='b', foot=(47, G - 5), fa=90, fl=5, hd=40), arr=[(116, 195, 126, 228)]),
  scene=[GR])

E('wall-handstand-hold', 'Wall handstand hold', 'Poirier au mur (maintien)', 'push', 'vertical push', ['front delts', 'triceps'], ['traps', 'core', 'wrists'],
  BW, 4, 'time', 'pike-handstand',
  'Kick up with your belly toward the wall, hands about 20 cm from the wall, arms locked.',
  ['Push tall through the shoulders, ears between the arms.', 'Squeeze glutes and abs to stay straight.',
   'Breathe and hold the position.'],
  ['Banana back (arched lower back)', 'Bent elbows', 'Hands too far from the wall'],
  'Practice the exit (cartwheel out or step down) before long holds.',
  dict(pose=dict(hip=(100, 164), t=90, hand=(100, G), ab='b', foot=(112, 106), fa=0, fl=8, hd=0, lb='f')), None,
  scene=[GR, ('wall', 124, 1)])

E('wall-handstand-push-up', 'Wall handstand push-up', 'Pompe en poirier au mur', 'push', 'vertical push', ['front delts', 'triceps'], ['traps', 'core', 'upper chest'],
  BW, 5, 'reps', 'pike-handstand',
  'Belly-to-wall handstand, hands shoulder-width, body straight.',
  ['Lower the head toward the floor in a controlled path.', 'Lightly touch the head or a pad.', 'Press back up to full lockout.'],
  ['Kipping the legs', 'Arching the back', 'Dropping too fast'],
  'Use pike push-ups and short-range negatives first; place a folded mat under the head.',
  dict(pose=dict(hip=(100, 164), t=90, hand=(100, G), ab='b', foot=(112, 106), fa=0, fl=8, hd=0)),
  dict(pose=dict(hip=(100, 186), t=90, hand=(100, G), ab='b', foot=(112, 128), fa=0, fl=8, hd=0)),
  scene=[GR, ('wall', 124, 1)])

# ---- kettlebell press
E('kettlebell-overhead-press', 'Kettlebell overhead press', 'Développé militaire (kettlebell)', 'push', 'vertical push', ['front delts', 'triceps'], ['upper chest', 'core', 'traps'],
  ['kettlebell'], 2, 'reps-per-side', 'overhead-press',
  'Stand tall, kettlebell racked at the shoulder, wrist straight, feet hip-width.',
  ['Squeeze glutes and abs; do not lean back.', 'Press straight up until the arm is fully locked, biceps by the ear.',
   'Lower back to the rack with control.'],
  ['Leaning back to finish the press', 'Bent wrist', 'Elbow drifting forward'],
  'Pick a light bell first; the small kettlebell makes this a great shoulder finisher.',
  dict(pose=stand(100, hand=(106, 150), ab='d'), over=[('kb', 'hand', 5, -4)]),
  dict(pose=stand(100, hand=(101, 104), ab='b'), over=[('kb', 'hand', -9, 4)]), scene=[GR])
