from lib import *
from reg import E, chain

GR = ('ground',)
BW = ['bodyweight']

chain('squat', ['bodyweight-squat', 'goblet-squat', 'split-squat', 'cossack-squat', 'assisted-pistol-squat', 'pistol-squat'])
chain('glute-bridge', ['glute-bridge', 'single-leg-glute-bridge'])
chain('calf', ['calf-raise', 'single-leg-calf-raise'])
chain('hinge', ['kettlebell-deadlift', 'single-leg-rdl'])

SQ_TOP = stand(100, hand=(138, 156))
SQ_BOT = dict(hip=(72, 206), t=-58, hand=(138, 176), ab='b', foot=(100, G), fa=0, fl=9, lb='f')

E('bodyweight-squat', 'Bodyweight squat', 'Squat au poids du corps', 'legs', 'squat', ['quads', 'glutes'], ['hamstrings', 'core', 'calves'],
  BW, 1, 'reps', 'squat',
  'Feet shoulder-width, toes slightly out, arms forward for balance.',
  ['Brace the core and sit the hips back and down.', 'Keep the heels down and knees tracking over the toes.', 'Reach at least thigh-parallel, then drive up through the whole foot.'],
  ['Heels lifting', 'Knees caving in', 'Chest collapsing forward'],
  'Pause 1 second at the bottom for control.',
  dict(pose=SQ_TOP), dict(pose=SQ_BOT), scene=[GR])

E('goblet-squat', 'Goblet squat', 'Squat gobelet', 'legs', 'squat', ['quads', 'glutes'], ['core', 'upper back', 'hamstrings'],
  ['kettlebell'], 2, 'reps', 'squat',
  'Hold the kettlebell by the horns at the chest, elbows pointing down, feet shoulder-width.',
  ['Keep the bell close to the chest.', 'Sit between the hips, elbows inside the knees.', 'Drive up, chest tall.'],
  ['Bell drifting away from the chest', 'Heels lifting', 'Rounding the upper back'],
  'The counterweight makes it easier to stay upright and go deep.',
  dict(pose=stand(100, hand=(112, 154), ab='d'), over=[('kb', 'hand', 8, 6)]),
  dict(pose=dict(SQ_BOT, hand=(116, 168), ab='d'), over=[('kb', 'hand', 8, 6)]), scene=[GR])

E('jump-squat', 'Jump squat', 'Squat sauté', 'legs', 'squat', ['quads', 'glutes'], ['calves', 'hamstrings', 'core'],
  BW, 2, 'reps', 'plyometric',
  'Squat stance, arms ready to swing.',
  ['Drop into a quarter to half squat.', 'Explode up, extending hips, knees and ankles.', 'Land softly on the midfoot and sink straight into the next rep.'],
  ['Stiff, loud landings', 'Knees caving on landing', 'Shallow, rushed reps'],
  'Land quietly; stop when you can no longer.',
  dict(pose=SQ_BOT), dict(pose=dict(hip=(100, 150), t=-90, hand=(112, 98), ab='b', foot=(100, 208), fa=60, fl=9), arr=[(100, 236, 100, 214)]),
  scene=[GR])

E('split-squat', 'Split squat', 'Squat fendu (statique)', 'legs', 'squat', ['quads', 'glutes'], ['hamstrings', 'core', 'adductors'],
  BW, 2, 'reps-per-side', 'squat',
  'Long staggered stance, front foot flat, back heel raised, torso upright.',
  ['Lower the back knee straight down toward the floor.', 'Keep the front shin close to vertical.', 'Press through the front foot to rise.'],
  ['Stance too short', 'Front heel lifting', 'Leaning forward and bouncing'],
  'Hold a doorframe lightly for balance if needed.',
  dict(pose=dict(hip=(90, 194), t=-90, foot=(116, G), lb='f', foot2=(56, G - 4), lb2='d', fa=0, fl=9, fa2=-40, arm=(90, 90), arm2=(90, 90))),
  dict(pose=dict(hip=(90, 222), t=-90, foot=(116, G), lb='f', foot2=(56, G - 4), lb2='d', fa=0, fl=9, fa2=-40, arm=(90, 90), arm2=(90, 90))),
  scene=[GR])

E('reverse-lunge', 'Reverse lunge', 'Fente arrière', 'legs', 'lunge', ['quads', 'glutes'], ['hamstrings', 'core'],
  BW, 2, 'reps-per-side', 'lunge',
  'Stand tall, feet hip-width, hands on hips.',
  ['Step one foot back and lower until both knees are about 90°.', 'Keep the front shin vertical and torso upright.', 'Push through the front heel to return.'],
  ['Front knee collapsing in', 'Short step, forcing the knee forward', 'Torso collapsing'],
  'Easier on the knees than a forward lunge.',
  dict(pose=stand(100)),
  dict(pose=dict(hip=(92, 220), t=-90, foot=(108, G), lb='f', foot2=(50, G - 4), lb2='d', fa=0, fl=9, fa2=-40, arm=(90, 90), arm2=(90, 90)), arr=[(70, 236, 52, 236)]),
  scene=[GR], noauto=False)

E('lateral-lunge', 'Lateral lunge', 'Fente latérale', 'legs', 'lunge', ['quads', 'glutes', 'adductors'], ['hamstrings', 'core'],
  BW, 2, 'reps-per-side', 'lunge',
  'Stand tall, feet together, toes forward.',
  ['Step wide to the side and sit back over that leg.', 'Keep the other leg straight, both feet flat.', 'Push off the bent leg to return to standing.'],
  ['Heel lifting on the working leg', 'Chest dropping', 'Knee caving inward'],
  'Hold a goblet kettlebell once the bodyweight version is easy.',
  dict(pose=dict(hip=(100, 190), t=-90, foot=(96, G), foot2=(104, G), lb='f', lb2='b', arm=(90, 90), arm2=(90, 90), fl=0), ),
  dict(pose=dict(hip=(124, 222), t=-90, foot=(140, G), lb='f', foot2=(70, G), lb2='b', arm=(60, 20), arm2=(60, 20), fl=0)),
  scene=[GR], note='front view')

E('cossack-squat', 'Cossack squat', 'Squat cosaque', 'legs', 'squat', ['quads', 'glutes', 'adductors'], ['hamstrings', 'core'],
  BW, 3, 'reps-per-side', 'squat',
  'Very wide stance, toes slightly out, arms in front for balance.',
  ['Shift your weight to one side and sit deep on that leg.', 'Keep the other leg straight with the heel down (toes can lift).', 'Drive back through the bent leg to center, then switch sides.'],
  ['Heel of the working leg lifting', 'Not sitting deep', 'Collapsing the chest'],
  'Hold a doorframe at first. Great hip mobility builder.',
  dict(pose=dict(hip=(100, 198), t=-90, foot=(134, G), foot2=(66, G), lb='f', lb2='b', arm=(60, 50), arm2=(60, 50), fl=0)),
  dict(pose=dict(hip=(78, 222), t=-90, foot=(130, G), foot2=(62, G), lb='f', lb2='b', arm=(60, 50), arm2=(60, 50), fl=0)),
  scene=[GR], note='front view')

E('assisted-pistol-squat', 'Assisted pistol squat', 'Squat pistolet assisté', 'legs', 'squat', ['quads', 'glutes'], ['core', 'adductors', 'calves'],
  ['bands', 'pullup-bar'], 4, 'reps-per-side', 'squat',
  'Hang a band from the pull-up bar and hold it with both hands; stand on one leg, other leg forward.',
  ['Lower slowly on one leg, using the band only as needed.', 'Keep the free leg off the floor and the heel down.', 'Drive up with the working leg; reduce the pull over time.'],
  ['Pulling up with the arms', 'Heel lifting', 'Dropping to the bottom'],
  'Move your hand lower on the band as you get stronger.',
  dict(pose=dict(hip=(100, 190), t=-90, hand=(116, 150), ab='b', foot=(100, G), fa=0, fl=9, foot2=(156, 194), lb2='u', fa2=-80), over=[('band', (122, 56), 'hand', 0)]),
  dict(pose=dict(hip=(78, 212), t=-65, hand=(116, 156), ab='b', foot=(100, G), fa=0, fl=9, foot2=(136, 204), lb2='u', fa2=-80), over=[('band', (122, 56), 'hand', 0)]),
  scene=[GR, ('bar', 122, 50)])

E('pistol-squat', 'Pistol squat', 'Squat pistolet', 'legs', 'squat', ['quads', 'glutes'], ['core', 'adductors', 'calves'],
  BW, 5, 'reps-per-side', 'squat',
  'Stand on one leg, free leg extended forward, arms forward for balance.',
  ['Sit back and down on the standing leg, keeping the heel flat.', 'Hold the free leg straight and off the floor.', 'Drive up through the whole foot.'],
  ['Heel lifting', 'Free foot touching down', 'Dropping into the bottom'],
  'Use boxes or the assisted version to build range first.',
  dict(pose=dict(hip=(100, 190), t=-90, hand=(138, 160), ab='b', foot=(100, G), fa=0, fl=9, foot2=(158, 194), lb2='u', fa2=-80)),
  dict(pose=dict(hip=(70, 214), t=-55, hand=(138, 184), ab='b', foot=(100, G), fa=0, fl=9, foot2=(128, 208), lb2='u', fa2=-80)),
  scene=[GR])

E('wall-sit', 'Wall sit', 'Chaise murale', 'legs', 'squat', ['quads'], ['glutes', 'calves', 'core'],
  BW, 1, 'time', 'isometric-squat',
  'Back flat on a wall, feet about 60 cm out, thighs parallel to the floor.',
  ['Slide down until knees are at about 90°.', 'Keep the back flat on the wall and weight through the heels.', 'Hold and breathe.'],
  ['Knees past the toes', 'Hands pushing on the thighs', 'Sitting too high'],
  'Add 10 seconds each session.',
  dict(pose=dict(hip=(76, 220), t=-90, hand=(98, 216), ab='b', foot=(106, G), fa=0, fl=9, lb='f')), None,
  scene=[GR, ('wall', 66, -1)])

E('glute-bridge', 'Glute bridge', 'Pont fessier', 'legs', 'hip extension', ['glutes'], ['hamstrings', 'core'],
  BW, 1, 'reps', 'glute-bridge',
  'Lie on your back, knees bent, feet flat hip-width, arms by sides.',
  ['Press through the heels and lift the hips.', 'Squeeze the glutes at the top; body in a line from shoulders to knees.', 'Lower with control.'],
  ['Arching the lower back', 'Pushing through the toes', 'Knees falling in'],
  'Pause 2 seconds at the top.',
  dict(pose=dict(hip=(112, 242), t=178, arm=(25, 15), foot=(150, 246), lb='u', fa=0, fl=8, hd=0)),
  dict(pose=dict(hip=(112, 208), t=142, arm=(25, 15), foot=(150, 246), lb='u', fa=0, fl=8, hd=38)), scene=[GR])

E('single-leg-glute-bridge', 'Single-leg glute bridge', 'Pont fessier à une jambe', 'legs', 'hip extension', ['glutes'], ['hamstrings', 'core'],
  BW, 2, 'reps-per-side', 'glute-bridge',
  'Lie on your back, one foot planted, the other leg extended.',
  ['Drive through the planted heel to lift the hips.', 'Keep the pelvis level and the free leg in line with the thigh.', 'Lower slowly.'],
  ['Hips rotating', 'Over-arching the back', 'Pushing with the toes'],
  'Slow tempo makes it far harder.',
  dict(pose=dict(hip=(112, 242), t=178, arm=(25, 15), foot=(150, 246), lb='u', fa=0, fl=8, foot2=(166, 224), lb2='u')),
  dict(pose=dict(hip=(112, 208), t=142, arm=(25, 15), foot=(150, 246), lb='u', fa=0, fl=8, hd=38, foot2=(150, 166), lb2='u')), scene=[GR])

E('calf-raise', 'Calf raise', 'Élévation des mollets', 'legs', 'plantar flexion', ['calves'], ['ankle stabilisers'],
  BW, 1, 'reps', 'calf',
  'Stand tall, feet hip-width, a hand on a wall for balance if needed.',
  ['Rise onto the balls of the feet as high as you can.', 'Pause at the top.', 'Lower slowly until the heels reach the floor.'],
  ['Bouncing', 'Rolling onto the outside of the feet', 'Partial range'],
  'Go slowly; a 3-second lowering works well.',
  dict(pose=stand(100)), dict(pose=dict(hip=(100, G - 14 - 60), t=-90, foot=(100, G - 14), fa=60, fl=16, arm=(90, 90)), arr=[(130, 228, 130, 208)]), scene=[GR])

E('single-leg-calf-raise', 'Single-leg calf raise', 'Mollet à une jambe', 'legs', 'plantar flexion', ['calves'], ['ankle stabilisers'],
  BW, 2, 'reps-per-side', 'calf',
  'Stand on one foot, other foot lifted behind, fingertips on a wall.',
  ['Rise as high as possible on the working foot.', 'Hold a second at the top.', 'Lower slowly below the floor line if standing on a step.'],
  ['Bouncing', 'Leaning on the wall', 'Rolling outward'],
  'Add reps before adding a step to extend the range.',
  dict(pose=dict(hip=(100, 190), t=-90, foot=(100, G), fa=0, fl=9, foot2=(80, G - 24), lb2='f', arm=(90, 90))),
  dict(pose=dict(hip=(100, 176), t=-90, foot=(100, G - 14), fa=60, fl=16, foot2=(80, G - 38), lb2='f', arm=(90, 90)), arr=[(130, 228, 130, 208)]), scene=[GR])

E('single-leg-rdl', 'Single-leg Romanian deadlift', 'Soulevé de terre roumain à une jambe', 'legs', 'hip hinge', ['hamstrings', 'glutes'], ['core', 'calves', 'back extensors'],
  BW, 2, 'reps-per-side', 'hinge',
  'Stand on one foot with a soft knee, other foot just off the floor.',
  ['Hinge at the hip and send the free leg straight back.', 'Keep a flat back and level hips until the torso is near parallel.', 'Squeeze the glute to stand back up.'],
  ['Rounding the back', 'Hips rotating open', 'Bending the standing knee too much'],
  'Touch a fingertip to a wall for balance at first.',
  dict(pose=dict(hip=(100, 190), t=-90, foot=(100, G), fa=0, fl=9, foot2=(86, G - 24), lb2='f', arm=(90, 90))),
  dict(pose=dict(hip=(92, 196), t=-12, foot=(94, G), fa=0, fl=9, foot2=(34, 190), lb2='f', arm=(90, 90), hd=-8)), scene=[GR])

E('kettlebell-deadlift', 'Kettlebell deadlift', 'Soulevé de terre (kettlebell)', 'legs', 'hip hinge', ['glutes', 'hamstrings'], ['back extensors', 'core', 'forearms'],
  ['kettlebell'], 1, 'reps', 'hinge',
  'Kettlebell on the floor between the feet, feet hip-width, hips back, flat back.',
  ['Grip the handle, brace, and push the floor away.', 'Stand tall, squeezing the glutes at the top.', 'Hinge back down, bell tracking close to the legs.'],
  ['Rounding the back', 'Squatting instead of hinging', 'Hyperextending at the top'],
  'Sets the pattern for swings.',
  dict(pose=dict(hip=(78, 205), t=-25, hand=(112, 229), ab='b', foot=(100, G), fa=0, fl=9, lb='f'), over=[('kb', (108, 238), 0, 0)]),
  dict(pose=stand(100, hand=(102, 194)), over=[('kb', 'hand', 0, 10)]), scene=[GR])

E('band-lateral-walk', 'Band lateral walk', 'Marche latérale (élastique)', 'legs', 'hip abduction', ['glute medius'], ['glutes', 'quads', 'core'],
  ['bands'], 1, 'reps-per-side', 'hip-abduction',
  'Band just above the knees, quarter-squat, feet hip-width, hands in front.',
  ['Take a controlled step sideways, keeping tension on the band.', 'Stay low; knees pushed out over the toes.', 'Follow with the other foot without letting the feet touch.'],
  ['Standing up between steps', 'Knees caving in', 'Torso leaning'],
  'Take 10-15 steps each way.',
  dict(pose=dict(hip=(100, 200), t=-90, foot=(122, G), foot2=(78, G), lb='f', lb2='b', arm=(60, 55), arm2=(60, 55), fl=0), over=[('band', 'knee', 'knee2', 0)]),
  dict(pose=dict(hip=(94, 200), t=-90, foot=(122, G), foot2=(66, G), lb='f', lb2='b', arm=(60, 55), arm2=(60, 55), fl=0), over=[('band', 'knee', 'knee2', 0)], arr=[(70, 238, 54, 238)]),
  scene=[GR], note='front view')
