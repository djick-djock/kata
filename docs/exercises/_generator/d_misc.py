from lib import *
from reg import E, chain

GR = ('ground',)
BW = ['bodyweight']

chain('hinge', ['kettlebell-deadlift', 'single-leg-rdl', 'kettlebell-swing'])
chain('burpee', ['inchworm', 'burpee'])

QUAD = dict(hip=(78, 217), t=-12, hand=(119, G), ab='b', leg=(90, 180), fa=180, fl=8)

# ------------------------------------------------------------------ mobility
E('cat-cow', 'Cat-cow', 'Chat-vache', 'mobility', 'spinal flexion/extension', ['spinal erectors', 'abs'], ['shoulders', 'hips'],
  BW, 1, 'reps', 'spine-mobility',
  'On all fours, hands under shoulders, knees under hips.',
  ['Inhale: drop the belly, lift the chest and tailbone (cow).', 'Exhale: round the back, tuck chin and tailbone (cat).', 'Move slowly through the whole spine.'],
  ['Moving only the neck', 'Rushing', 'Bending the elbows'],
  'Link the movement to your breathing.',
  dict(pose=dict(QUAD, t=-6, hd=-30, hip=(78, 220)), arr=[(86, 190, 100, 176)]),
  dict(pose=dict(QUAD, t=-16, hd=40, hip=(78, 216)), arr=[(86, 176, 100, 190)]), scene=[GR], noauto=True, endlabel='CAT')

E('child-pose', "Child's pose", "Posture de l'enfant", 'mobility', 'hip/shoulder stretch', ['lats', 'glutes'], ['lower back', 'shoulders'],
  BW, 1, 'time', 'floor-mobility',
  'Kneel, big toes together, knees apart or together, sit back on the heels.',
  ['Fold forward and reach the arms in front.', 'Rest the forehead on the floor.', 'Breathe slowly into the back.'],
  ['Forcing the hips up', 'Tensing the shoulders'],
  'Use it as a rest between hard sets.',
  dict(hip=(78, 232), t=-8, hand=(160, 246), ab='b', leg=(20, 180), fa=180, fl=0, hd=28), None, scene=[GR])

E('downward-dog', 'Downward dog', 'Chien tête en bas', 'mobility', 'posterior chain stretch', ['hamstrings', 'calves', 'shoulders'], ['lats', 'core'],
  BW, 1, 'time', 'floor-mobility',
  'From hands and knees, tuck the toes and lift the hips up and back.',
  ['Press the floor away; arms long.', 'Send the hips high; heels reach toward the floor.', 'Keep the spine long, head between the arms.'],
  ['Rounding the lower back', 'Hands too close to the feet', 'Locking the shoulders'],
  'Bend the knees slightly if the hamstrings are tight.',
  dict(hip=(74, 196), t=40, hand=(139, G), ab='b', foot=(47, G - 5), fa=90, fl=5, hd=40), None, scene=[GR])

E('deep-squat-hold', 'Deep squat hold', 'Squat profond (maintien)', 'mobility', 'squat', ['hips', 'ankles'], ['quads', 'adductors', 'lower back'],
  BW, 1, 'time', 'floor-mobility',
  'Feet shoulder-width or a little wider, toes slightly out, sink all the way down.',
  ['Press the elbows against the knees, hands together.', 'Keep the chest tall and heels down.', 'Breathe and shift gently side to side.'],
  ['Heels lifting', 'Collapsing the back', 'Knees caving in'],
  'Hold a doorframe if your heels lift.',
  dict(hip=(82, 226), t=-72, hand=(116, 206), ab='d', foot=(100, G), fa=0, fl=9, lb='f'), None, scene=[GR])

E('hip-flexor-stretch', 'Half-kneeling hip flexor stretch', 'Étirement des fléchisseurs de hanche', 'mobility', 'hip extension stretch', ['hip flexors', 'quads'], ['glutes'],
  BW, 1, 'time-per-side', 'floor-mobility',
  'Half-kneeling lunge, back knee on a pad, front foot flat ahead.',
  ['Tuck the pelvis under (squeeze the back-side glute).', 'Shift the hips forward until you feel the front of the back hip.', 'Raise the same-side arm for more stretch.'],
  ['Arching the lower back', 'Leaning forward from the waist', 'Knee too far past the toes'],
  'Hold 30-60 seconds per side.',
  dict(hip=(96, 222), t=-90, arm=(-80, -80), foot=(128, G), lb='f', leg2=(115, 180), fa=0, fl=9), None, scene=[GR])

E('thoracic-rotation', 'Quadruped thoracic rotation', 'Rotation thoracique à quatre pattes', 'mobility', 'thoracic rotation', ['thoracic spine'], ['obliques', 'shoulders'],
  BW, 1, 'reps-per-side', 'spine-mobility',
  'On all fours, one hand behind the head, other hand under the shoulder.',
  ['Rotate the chest toward the floor, elbow in.', 'Then open the chest and point the elbow to the ceiling.', 'Follow the elbow with your eyes.'],
  ['Moving from the lower back', 'Hips shifting back', 'Rushing'],
  'Pause at the top and exhale.',
  dict(pose=dict(QUAD, hand=None, hip=(78, 217)) if False else dict(hip=(78, 217), t=-12, hand=(122, 190), ab='d', leg=(90, 180), fa=180, fl=8, hand2=(119, G), ab2='b')),
  dict(pose=dict(hip=(78, 217), t=-12, hand=(122, 190), ab='u', leg=(90, 180), fa=180, fl=8, hand2=(119, G), ab2='b')), scene=[GR], noauto=True,
  note='elbow of the hand behind the head: down, then up')

E('shoulder-pass-through', 'Band shoulder pass-through', 'Passage d\'épaules (élastique)', 'mobility', 'shoulder mobility', ['rotator cuff', 'delts'], ['chest', 'lats'],
  ['bands'], 1, 'reps', 'shoulder-mobility',
  'Hold a band with a wide overhand grip in front of the thighs, arms straight.',
  ['Lift the band overhead, arms straight.', 'Continue behind the head toward the lower back.', 'Reverse with control; widen the grip if it is too hard.'],
  ['Bending the elbows', 'Arching the lower back', 'Grip too narrow'],
  'Use the widest comfortable grip and go slowly.',
  dict(pose=stand(100, arm=(60, 60), arm2=(60, 60)), over=[('band', 'hand', 'hand2', 0)]),
  dict(pose=stand(100, arm=(135, 135), arm2=(135, 135)), over=[('band', 'hand', 'hand2', 0)], arr=[(138, 128, 110, 112)]), scene=[GR],
  noauto=True)

E('arm-circles', 'Arm circles', 'Cercles de bras', 'mobility', 'shoulder mobility', ['delts', 'rotator cuff'], ['traps'],
  BW, 1, 'time', 'shoulder-mobility',
  'Stand tall, arms straight out to the sides at shoulder height.',
  ['Draw small circles, gradually making them bigger.', 'Keep shoulders down and the core braced.', 'Switch direction halfway.'],
  ['Shrugging', 'Arching the back', 'Going too fast'],
  'Great warm-up before push or pull work.',
  dict(pose=stand(100, arm=(-10, -10), arm2=(-10, -10)), arr=[(150, 140, 156, 164, 18), (156, 164, 128, 176, 18)]), None, scene=[GR])

E('kettlebell-halo', 'Kettlebell halo', 'Halo avec kettlebell', 'mobility', 'shoulder mobility', ['delts', 'rotator cuff'], ['triceps', 'core', 'upper back'],
  ['kettlebell'], 2, 'reps', 'shoulder-mobility',
  'Stand tall, kettlebell held upside down by the horns at chest height.',
  ['Circle the bell around the head, keeping it close.', 'Keep ribs down and glutes squeezed.', 'Alternate directions each set.'],
  ['Leaning back', 'Bell drifting far from the head', 'Shrugging'],
  'Use a light bell: it is a mobility drill, not a strength drill.',
  dict(pose=stand(100, hand=(112, 150), ab='d'), over=[('kb', 'hand', 6, 4)]),
  dict(pose=stand(100, hand=(90, 118), ab='u'), over=[('kb', 'hand', -4, -4)], arr=[(122, 104, 82, 100)]), scene=[GR], noauto=True)

# ------------------------------------------------------------------ full body
E('burpee', 'Burpee', 'Burpee', 'full-body', 'conditioning', ['quads', 'chest', 'core'], ['shoulders', 'glutes', 'triceps'],
  BW, 3, 'reps', 'burpee',
  'Stand tall, feet shoulder-width.',
  ['Drop hands to the floor and jump or step the feet back to a plank.', 'Lower the chest to the floor (optional), push up.', 'Jump the feet in and explode up with arms overhead.'],
  ['Sagging in the plank', 'Landing heavily', 'Rushing with poor form'],
  'Step back instead of jumping to scale; keep the pace sustainable.',
  dict(pose=prone(28, 232, (sx(28, 232), G))),
  dict(pose=dict(hip=(100, 150), t=-90, hand=(112, 98), ab='b', foot=(100, 208), fa=60, fl=9), arr=[(100, 236, 100, 214)]), scene=[GR],
  noauto=True, endlabel='JUMP')

E('inchworm', 'Inchworm', 'Marche de la chenille', 'full-body', 'plank walkout', ['core', 'shoulders'], ['hamstrings', 'chest', 'calves'],
  BW, 1, 'reps', 'burpee',
  'Stand tall, then fold forward and place the hands on the floor (knees soft if needed).',
  ['Walk the hands forward to a high plank.', 'Pause, brace the core, keep hips level.', 'Walk the hands back to the feet, then stand up.'],
  ['Sagging hips at the end', 'Bending the knees too much', 'Rushing'],
  'Add a push-up at the plank for an extra challenge.',
  dict(pose=dict(hip=(84, 196), t=50, hand=(112, G), ab='b', foot=(60, G - 5), fa=90, fl=5, hd=30)),
  dict(pose=prone(28, 204, (sx(28, 204), G))), scene=[GR], noauto=True)

E('bear-crawl', 'Bear crawl', 'Marche de l\'ours', 'full-body', 'locomotion', ['core', 'shoulders', 'quads'], ['hips', 'chest', 'triceps'],
  BW, 2, 'time', 'locomotion',
  'On all fours, knees hovering a hand\'s width above the floor.',
  ['Keep the back flat and hips low.', 'Move opposite hand and foot together.', 'Take small steps forward, then back.'],
  ['Hips rising', 'Rushing steps', 'Knees touching the floor'],
  'Crawl 5-10 meters at a time.',
  dict(hip=(74, 208), t=-8, hand=(118, G), ab='b', foot=(60, G - 5), fa=90, fl=5, lb='f', hd=0), None, scene=[GR],
  )

E('kettlebell-swing', 'Kettlebell swing', 'Balancement kettlebell', 'full-body', 'hip hinge (ballistic)', ['glutes', 'hamstrings'], ['core', 'shoulders', 'back extensors'],
  ['kettlebell'], 3, 'reps', 'hinge',
  'Feet slightly wider than the shoulders, kettlebell on the floor in front; hinge and hike it between the legs.',
  ['Hinge back, flat back, bell between the thighs.', 'Snap the hips forward to float the bell to chest height.', 'Let it fall and hinge back to absorb it.'],
  ['Squatting instead of hinging', 'Lifting the bell with the arms', 'Leaning back at the top'],
  'Power comes from the hips; arms are just hooks.',
  dict(pose=dict(hip=(72, 200), t=-30, hand=(98, 220), ab='b', foot=(100, G), fa=0, fl=9, lb='f'), over=[('kb', 'hand', 0, 10)]),
  dict(pose=stand(100, hand=(144, 150), ab='b'), over=[('kb', 'hand', 6, 6)]), scene=[GR], noauto=True)

E('jumping-jack', 'Jumping jack', 'Sauts d\'étoile', 'full-body', 'conditioning', ['calves', 'delts'], ['quads', 'glutes', 'core'],
  BW, 1, 'time', 'locomotion',
  'Stand with feet together, arms by the sides.',
  ['Jump the feet apart while swinging the arms overhead.', 'Jump back to the start.', 'Land softly and stay light on the feet.'],
  ['Heavy landings', 'Locking the knees', 'Slouching'],
  'Good warm-up; step-jacks are a low-impact version.',
  dict(pose=dict(hip=(100, 190), t=-90, foot=(98, G), foot2=(102, G), lb='f', lb2='b', arm=(100, 95), arm2=(80, 85), fl=0)),
  dict(pose=dict(hip=(100, 194), t=-90, foot=(124, G), foot2=(76, G), lb='f', lb2='b', arm=(-55, -70), arm2=(-125, -110), fl=0)), scene=[GR],
  note='front view', noauto=True)

E('mountain-climber', 'Mountain climber', 'Grimpeur', 'full-body', 'conditioning', ['abs', 'hip flexors'], ['shoulders', 'quads', 'chest'],
  BW, 2, 'time', 'locomotion',
  'High plank, hands under shoulders, body straight.',
  ['Drive one knee toward the chest.', 'Switch legs quickly, hips level.', 'Keep the shoulders over the hands and the core braced.'],
  ['Hips bouncing up', 'Hips sagging', 'Hands drifting forward'],
  'Slow it down for control; speed it up for conditioning.',
  dict(pose=prone(28, 204, (sx(28, 204), G), foot2=(28, G - 5), lb2='f')),
  dict(pose=prone(28, 204, (sx(28, 204), G), foot=(112, 238), lb='u', foot2=(28, G - 5), lb2='f')), scene=[GR], noauto=True)
