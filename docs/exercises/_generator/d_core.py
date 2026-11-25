from lib import *
from reg import E, chain

GR = ('ground',)
BW = ['bodyweight']
BAR = ('bar', 100, 50)

chain('plank', ['plank', 'plank-shoulder-tap'])
chain('hanging-core', ['hanging-knee-raise', 'hanging-leg-raise', 'toes-to-bar'])
chain('l-sit', ['tuck-l-sit', 'l-sit'])
chain('leg-raise', ['lying-leg-raise', 'v-up'])
chain('crunch', ['crunch', 'bicycle-crunch'])
chain('hollow', ['dead-bug', 'hollow-body-hold'])
chain('back-extension', ['bird-dog', 'superman'])


def lie(hx=120, t=180, **kw):
    hip = (hx, G - 6)
    S = add(hip, dirv(t), LT)
    p = dict(hip=hip, t=t, hand=(S[0] + 14, S[1] - 6), ab='u', foot=(hx + 38, G - 4), lb='u', fa=0, fl=8)
    p.update(kw)
    return p


def fplank(Fx, Sy, **kw):
    p = prone(Fx, Sy, (0, 0), **kw)
    del p['hand']
    p['arm'] = (90, 0)
    return p


E('plank', 'Plank', 'Planche abdominale (gainage)', 'core', 'anti-extension', ['abs', 'transverse abdominis'], ['glutes', 'shoulders', 'lower back'],
  BW, 1, 'time', 'plank',
  'Forearms on the floor, elbows under shoulders, legs straight, toes down.',
  ['Squeeze glutes and abs; ribs down.', 'Keep a straight line from head to heels.', 'Breathe steadily while you hold.'],
  ['Sagging hips', 'Hips too high', 'Holding the breath'],
  'Quality over time: stop when the hips start to sag.',
  fplank(40, G - 27), None, scene=[GR])

E('plank-shoulder-tap', 'Plank shoulder tap', 'Planche avec touche d\'épaule', 'core', 'anti-rotation', ['abs', 'obliques'], ['shoulders', 'glutes'],
  BW, 2, 'reps-per-side', 'plank',
  'High plank (arms straight), feet slightly wider than hip-width.',
  ['Brace the core and keep the hips level.', 'Lift one hand and tap the opposite shoulder.', 'Return it and alternate without rocking.'],
  ['Hips swaying side to side', 'Rushing', 'Sagging lower back'],
  'Widen the feet to make it easier; bring them closer to make it harder.',
  dict(pose=prone(28, 204, (sx(28, 204), G))),
  dict(pose=prone(28, 204, (sx(28, 204), G), hand2=(sx(28, 204) + 6, 214), ab2='u')), scene=[GR])

E('side-plank', 'Side plank', 'Planche latérale', 'core', 'lateral stability', ['obliques', 'glute medius'], ['shoulders', 'abs'],
  BW, 2, 'time-per-side', 'lateral-core',
  'Lie on one side, forearm under the shoulder, feet stacked.',
  ['Lift the hips so the body forms a straight line.', 'Keep the hips stacked and shoulders away from the ears.', 'Hold, then switch sides.'],
  ['Hips dropping', 'Rolling forward or backward', 'Shoulder collapsing'],
  'Drop the lower knee to the floor to make it easier.',
  dict(pose=dict(fplank(30, G - 27), arm2=(-90, -90))), None, scene=[GR], note='viewed from the front; top arm reaches up')

E('dead-bug', 'Dead bug', 'Insecte mort', 'core', 'anti-extension', ['abs', 'transverse abdominis'], ['hip flexors', 'obliques'],
  BW, 1, 'reps-per-side', 'hollow',
  'Lie on your back, arms up toward the ceiling, hips and knees bent at 90°.',
  ['Press the lower back gently into the floor.', 'Lower the opposite arm and leg slowly toward the floor.', 'Return and switch sides.'],
  ['Lower back arching', 'Moving too fast', 'Holding the breath'],
  'Only go as low as the back stays flat.',
  lie(120, 180, arm=(-90, -90), leg=(-90, 0), hd=0),
  lie(120, 180, arm=(-90, -90), leg=(-90, 0), arm2=(180, 180), leg2=(-8, -8)), scene=[GR], noauto=True)

E('bird-dog', 'Bird dog', 'Chien-oiseau', 'core', 'anti-rotation', ['lower back', 'glutes'], ['abs', 'shoulders'],
  BW, 1, 'reps-per-side', 'back-extension',
  'On all fours, hands under shoulders, knees under hips, back neutral.',
  ['Brace the abs, then reach one arm forward and the opposite leg back.', 'Keep hips and shoulders level.', 'Pause, return, and switch sides.'],
  ['Arching the lower back', 'Hips rotating open', 'Lifting the leg too high'],
  'Imagine balancing a cup on your lower back.',
  dict(pose=dict(hip=(78, 217), t=-12, hand=(119, G), ab='b', leg=(90, 180), fa=180, fl=8, hd=6)),
  dict(pose=dict(hip=(78, 217), t=-12, hand=(119, G), ab='b', leg=(90, 180), fa=180, fl=8, hd=6, arm2=(-12, -12), leg2=(176, 176))), scene=[GR],
  noauto=True)

E('hollow-body-hold', 'Hollow body hold', 'Position creuse (hollow)', 'core', 'anti-extension', ['abs'], ['hip flexors', 'quads'],
  BW, 3, 'time', 'hollow',
  'Lie on your back, arms overhead, legs straight.',
  ['Press the lower back into the floor.', 'Lift the shoulders and legs off the floor, body shaped like a shallow banana.', 'Breathe and hold.'],
  ['Lower back lifting off the floor', 'Neck straining', 'Legs too high to be challenging'],
  'Raise the legs for easier, lower them for harder; tuck knees to scale.',
  dict(pose=dict(hip=(140, 242), t=-155, arm=(-155, -155), foot=(196, 224), fa=-20, fl=6, lb='f', hd=8)), None, scene=[GR])

E('hanging-knee-raise', 'Hanging knee raise', 'Montée de genoux suspendue', 'core', 'hip flexion', ['abs', 'hip flexors'], ['forearms', 'lats'],
  ['pullup-bar'], 2, 'reps', 'hanging-core',
  'Hang from the bar, shoulders slightly pulled down.',
  ['Curl the pelvis up as the knees rise toward the chest.', 'Pause without swinging.', 'Lower slowly to a full hang.'],
  ['Swinging', 'Only lifting the thighs with the hip flexors', 'Dropping fast'],
  'Think of curling the pelvis, not just lifting the legs.',
  dict(pose=hang(100, 50, 46)), dict(pose=hang(100, 50, 46, leg=(-8, 98), fa=0, fl=0)), scene=[BAR], noauto=True)

E('hanging-leg-raise', 'Hanging leg raise', 'Relevé de jambes suspendu', 'core', 'hip flexion', ['abs', 'hip flexors'], ['forearms', 'lats'],
  ['pullup-bar'], 3, 'reps', 'hanging-core',
  'Hang from the bar, legs straight and together.',
  ['Brace, and raise straight legs to hip height or above.', 'Keep the body still and shoulders down.', 'Lower with control.'],
  ['Swinging', 'Bending the knees', 'Letting the back arch'],
  'Start with bent knees until straight legs are controlled.',
  dict(pose=hang(100, 50, 46)), dict(pose=hang(100, 50, 46, foot=(148, 138), lb='u', fa=-90, fl=6)), scene=[BAR], noauto=True)

E('toes-to-bar', 'Toes to bar', 'Orteils à la barre', 'core', 'hip flexion', ['abs', 'hip flexors'], ['lats', 'forearms', 'grip'],
  ['pullup-bar'], 4, 'reps', 'hanging-core',
  'Hang with a solid grip, shoulders active.',
  ['Pull the bar down slightly and lift straight legs.', 'Touch the toes to the bar.', 'Lower under control without a big swing.'],
  ['Kipping out of control', 'Bending the knees', 'Not reaching the bar'],
  'Practice strict leg raises first.',
  dict(pose=hang(100, 50, 46)), dict(pose=hang(100, 50, 46, foot=(124, 92), lb='f', fa=-60, fl=6)), scene=[BAR], noauto=True)

E('tuck-l-sit', 'Tuck L-sit', 'L-sit groupé', 'core', 'compression', ['abs', 'hip flexors'], ['triceps', 'shoulders'],
  ['parallel-bars'], 3, 'time', 'l-sit',
  'Support yourself on parallel bars, arms straight, shoulders pushed down.',
  ['Lift both knees to hip height and hold them tucked.', 'Keep the arms locked and the chest tall.', 'Breathe and hold.'],
  ['Shrugging', 'Legs dropping', 'Leaning back too far'],
  'Build time here before extending the legs.',
  dict(pose=support(100, 140, 96, lean=0, leg=(-5, 100), fa=0, fl=0)), None, scene=[GR, ('pbars', 66, 134, 140)])

E('l-sit', 'L-sit', 'L-sit', 'core', 'compression', ['abs', 'hip flexors'], ['triceps', 'quads', 'shoulders'],
  ['parallel-bars'], 4, 'time', 'l-sit',
  'Support on the bars with arms straight, legs together.',
  ['Press down hard, shoulders away from the ears.', 'Raise the straight legs until they are parallel to the floor.', 'Point the toes and hold.'],
  ['Bent knees', 'Rounded shoulders', 'Legs below parallel'],
  'Even 5-10 seconds of clean holds counts; repeat short sets.',
  dict(pose=support(100, 140, 96, lean=0, foot=(150, 138), lb='u', fa=-90, fl=6)), None, scene=[GR, ('pbars', 66, 134, 140)])

E('crunch', 'Crunch', 'Redressement assis court', 'core', 'spinal flexion', ['abs'], ['obliques'],
  BW, 1, 'reps', 'crunch',
  'Lie on your back, knees bent, feet flat, hands across the chest or by the temples.',
  ['Curl the ribs toward the pelvis, lifting the shoulder blades.', 'Pause, then lower slowly.', 'Keep the neck relaxed.'],
  ['Pulling on the neck', 'Using momentum', 'Lifting too high'],
  'Exhale on the way up.',
  lie(120, 180), lie(120, -158), scene=[GR], noauto=True)

E('bicycle-crunch', 'Bicycle crunch', 'Crunch vélo', 'core', 'rotation', ['obliques', 'abs'], ['hip flexors'],
  BW, 2, 'reps-per-side', 'crunch',
  'Lie on your back, hands by the temples, legs lifted.',
  ['Bring one knee toward the chest while the other leg extends.', 'Rotate the opposite elbow toward that knee.', 'Switch sides with a smooth pedaling motion.'],
  ['Pulling on the neck', 'Rushing', 'Back arching as the leg extends'],
  'Slow reps work the obliques better than fast ones.',
  lie(120, -160, foot=(138, 214), lb='u', foot2=(176, 236), lb2='u'),
  lie(120, -160, foot=(176, 236), lb='u', foot2=(138, 214), lb2='u'), scene=[GR], noauto=True)

E('lying-leg-raise', 'Lying leg raise', 'Relevé de jambes allongé', 'core', 'hip flexion', ['lower abs', 'hip flexors'], ['quads'],
  BW, 2, 'reps', 'leg-raise',
  'Lie on your back, hands under the hips, legs straight.',
  ['Press the lower back into the floor.', 'Raise the straight legs to vertical.', 'Lower slowly, stopping before the back arches.'],
  ['Lower back arching', 'Dropping legs fast', 'Bending knees'],
  'Bend the knees to regress.',
  lie(120, 180, arm=(40, 40), foot=(178, 232), lb='u', fa=0, fl=0), lie(120, 180, arm=(40, 40), foot=(122, 186), lb='u', fa=0, fl=0), scene=[GR],
  noauto=True)

E('v-up', 'V-up', 'V-up', 'core', 'compression', ['abs', 'hip flexors'], ['obliques'],
  BW, 3, 'reps', 'leg-raise',
  'Lie flat, arms overhead, legs straight.',
  ['Lift arms and legs at the same time.', 'Reach hands toward the toes, forming a V.', 'Lower with control, keeping the lower back flat.'],
  ['Throwing the arms', 'Bending the knees', 'Falling back'],
  'Bend the knees (tuck-up) if it is too hard.',
  lie(120, 180, arm=(180, 180), foot=(178, 228), lb='u', fa=0, fl=0),
  dict(hip=(120, 238), t=-125, hand=(138, 206), ab='b', foot=(162, 204), lb='u', fa=0, fl=0), scene=[GR], noauto=True)

E('russian-twist', 'Russian twist', 'Rotation russe', 'core', 'rotation', ['obliques'], ['abs', 'hip flexors'],
  BW, 2, 'reps-per-side', 'rotation',
  'Sit with knees bent, lean back to about 45°, feet lifted if possible.',
  ['Keep the back long and chest up.', 'Rotate the shoulders side to side, hands following.', 'Touch the floor beside each hip.'],
  ['Moving only the arms', 'Rounded back', 'Rushing'],
  'Hold the kettlebell at the chest to add load.',
  dict(hip=(110, G - 6), t=-125, hand=(118, 220), ab='u', foot=(150, 226), lb='u', fa=0, fl=0),
  dict(hip=(110, G - 6), t=-125, hand=(112, 238), ab='u', foot=(150, 226), lb='u', fa=0, fl=0), scene=[GR], noauto=True,
  note='top view of the twist not shown: rotate the torso')

E('superman', 'Superman', 'Superman', 'core', 'back extension', ['lower back', 'glutes'], ['hamstrings', 'rear delts'],
  BW, 1, 'time', 'back-extension',
  'Lie face down, arms extended overhead, legs straight.',
  ['Lift arms, chest and legs off the floor together.', 'Keep the neck neutral, looking at the floor.', 'Hold, then lower slowly.'],
  ['Cranking the neck up', 'Jerking up', 'Lifting too high'],
  'Pause and breathe; use short holds with repeats.',
  dict(hip=(110, 238), t=-18, arm=(-30, -30), leg=(172, 172), fa=172, fl=0, hd=-8), None, scene=[GR])

E('pallof-press', 'Pallof press', 'Presse Pallof', 'core', 'anti-rotation', ['obliques', 'transverse abdominis'], ['shoulders', 'glutes'],
  ['bands'], 2, 'reps-per-side', 'anti-rotation',
  'Anchor a band at chest height to your side, stand sideways to it, band held at the chest.',
  ['Brace and press the hands straight out in front.', 'Resist the band pulling you toward the anchor.', 'Hold a second, then bring the hands back.'],
  ['Letting the torso twist', 'Leaning away', 'Rushing'],
  'Step further from the anchor for more tension.',
  dict(pose=dict(hip=(100, 190), t=-90, hand=(112, 152), ab='d', foot=(100, G), fa=0, fl=9), over=[('band', (182, 150), 'hand', 0), ('anchor', 182, 150)]),
  dict(pose=dict(hip=(100, 190), t=-90, hand=(144, 150), ab='b', foot=(100, G), fa=0, fl=9), over=[('band', (182, 150), 'hand', 0), ('anchor', 182, 150)]), scene=[GR], noauto=True,
  note='anchor is to your side; shown from the front-left')
