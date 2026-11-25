from lib import *
from reg import E, chain

GR = ('ground',)
BAR = ('bar', 100, 50)
BW = ['bodyweight']
PB = ['pullup-bar']

chain('vertical-pull', ['dead-hang', 'scapular-pull-up', 'band-assisted-pull-up', 'negative-pull-up', 'chin-up', 'pull-up',
                        'neutral-grip-pull-up', 'l-sit-pull-up', 'archer-pull-up'])
chain('horizontal-pull', ['band-row', 'kettlebell-row'])
chain('shoulder-health', ['band-pull-apart', 'band-face-pull'])


def top(**kw):
    return hang(100, 50, 6, **kw)


E('dead-hang', 'Dead hang', 'Suspension à la barre', 'pull', 'vertical pull', ['forearms', 'lats'], ['shoulders', 'core'],
  PB, 1, 'time', 'vertical-pull',
  'Grip the bar slightly wider than shoulders, hang with arms straight and feet off the floor.',
  ['Let the shoulders relax up, then gently pull them down (active hang).', 'Keep ribs down and legs together.', 'Breathe and hold.'],
  ['Swinging', 'Overarched lower back', 'Shrugging the shoulders to the ears'],
  'Great for grip and shoulder health; build to 30-60 seconds.',
  dict(pose=hang(100, 50, 46)), None, scene=[BAR])

E('scapular-pull-up', 'Scapular pull-up', 'Tractions scapulaires', 'pull', 'vertical pull', ['lower traps', 'lats'], ['forearms', 'core'],
  PB, 1, 'reps', 'vertical-pull',
  'Hang from the bar with straight arms.',
  ['Keep the elbows straight.', 'Pull the shoulder blades down and back, lifting the body a few centimetres.', 'Lower slowly back to the full hang.'],
  ['Bending the elbows', 'Swinging', 'Tiny range with no shoulder movement'],
  'This teaches the first part of every pull-up.',
  dict(pose=hang(100, 50, 46)), dict(pose=hang(100, 50, 38), arr=[(84, 128, 84, 112)]), scene=[BAR])

E('band-assisted-pull-up', 'Band-assisted pull-up', 'Traction assistée (élastique)', 'pull', 'vertical pull', ['lats', 'biceps'], ['forearms', 'rear delts', 'core'],
  ['pullup-bar', 'bands'], 2, 'reps', 'vertical-pull',
  'Loop a band over the bar and set one knee or foot in it; hang with straight arms.',
  ['Pull the elbows down toward the ribs until the chin clears the bar.', 'Lower under control to straight arms.', 'Do not bounce out of the bottom.'],
  ['Bouncing off the band', 'Kipping', 'Stopping short of the bar'],
  'Use progressively lighter bands; the goal is to need less assistance.',
  dict(pose=hang(100, 50, 46, foot=(90, 188), lb='f'), over=[('band', (102, 56), 'knee', 8)]),
  dict(pose=hang(100, 50, 6, foot=(90, 150), lb='f'), over=[('band', (102, 56), 'knee', 8)]), scene=[BAR])

E('negative-pull-up', 'Negative pull-up', 'Traction négative', 'pull', 'vertical pull', ['lats', 'biceps'], ['forearms', 'core'],
  PB, 2, 'reps', 'vertical-pull',
  'Jump or step up so your chin is over the bar, hands shoulder-width or a bit wider.',
  ['Lower yourself as slowly as possible (3-5 seconds).', 'Keep shoulders down and body still.', 'Reach a full hang, then step up again.'],
  ['Dropping fast', 'Letting shoulders shrug at the bottom', 'Swinging'],
  'Five slow reps beat ten fast drops.',
  dict(pose=top()), dict(pose=hang(100, 50, 46)), scene=[BAR], endlabel='END (slow, 3-5 s)')

E('chin-up', 'Chin-up', 'Traction supination', 'pull', 'vertical pull', ['lats', 'biceps'], ['forearms', 'rear delts', 'core'],
  PB, 3, 'reps', 'vertical-pull',
  'Underhand (palms toward you) grip, shoulder-width, hang with straight arms.',
  ['Squeeze the bar and pull elbows down to the ribs.', 'Chin clears the bar with chest up.', 'Lower to straight arms under control.'],
  ['Half reps', 'Kipping or swinging', 'Craning the neck over the bar'],
  'Usually easier than a pull-up because the biceps help more.',
  dict(pose=hang(100, 50, 46)), dict(pose=top()), scene=[BAR], note='underhand grip: palms facing you')

E('pull-up', 'Pull-up', 'Traction', 'pull', 'vertical pull', ['lats', 'upper back'], ['biceps', 'forearms', 'core'],
  PB, 3, 'reps', 'vertical-pull',
  'Overhand grip slightly wider than shoulders, hang with straight arms, legs slightly forward.',
  ['Start with the shoulder blades down.', 'Pull the elbows toward the ribs until the chin clears the bar.', 'Lower to full hang under control.'],
  ['Kipping', 'Chin poking forward', 'Not going to full extension at the bottom'],
  'If you can do 8 clean reps, make it harder with the archer or L-sit versions.',
  dict(pose=hang(100, 50, 46)), dict(pose=top()), scene=[BAR])

E('neutral-grip-pull-up', 'Neutral-grip pull-up', 'Traction prise neutre', 'pull', 'vertical pull', ['lats', 'biceps'], ['forearms', 'rear delts', 'core'],
  ['parallel-bars'], 3, 'reps', 'vertical-pull',
  'Hang from parallel handles with palms facing each other (shoulder-width).',
  ['Pull the elbows toward the ribs.', 'Bring the chin above the handles.', 'Lower slowly to straight arms.'],
  ['Kipping', 'Half range', 'Shrugging at the top'],
  'Often the friendliest grip on elbows and shoulders.',
  dict(pose=hang(100, 50, 46)), dict(pose=top()), scene=[BAR], note='palms facing each other (parallel handles)')

E('l-sit-pull-up', 'L-sit pull-up', 'Traction en L', 'pull', 'vertical pull', ['lats', 'abs'], ['biceps', 'hip flexors', 'forearms'],
  PB, 4, 'reps', 'vertical-pull',
  'Hang with legs straight out in front at hip height, toes pointed.',
  ['Hold the legs up and pull the elbows down.', 'Chin clears the bar without the legs dropping.', 'Lower with the legs still raised.'],
  ['Bending the knees', 'Legs sinking as you tire', 'Swinging'],
  'Practice a hanging L-hold first, then add the pull.',
  dict(pose=hang(100, 50, 46, foot=(147, 138), lb='u', fa=-90, fl=6)),
  dict(pose=hang(100, 50, 6, foot=(147, 98), lb='u', fa=-90, fl=6)), scene=[BAR])

E('archer-pull-up', 'Archer pull-up', 'Traction archer', 'pull', 'vertical pull', ['lats', 'biceps'], ['forearms', 'obliques', 'core'],
  PB, 5, 'reps-per-side', 'vertical-pull',
  'Wide overhand grip, hang with straight arms.',
  ['Pull toward one hand, bending that elbow.', 'Keep the opposite arm straight along the bar.', 'Lower under control; alternate sides.'],
  ['Straight arm bending', 'Swinging', 'Chin not clearing the bar'],
  'Build with wide-grip pull-ups and band-assisted versions first.',
  dict(pose=hang(100, 50, 46)), dict(pose=hang(100, 50, 12, hand2=(124, 50)), noauto=False),
  scene=[BAR], note='near arm pulls; far arm stays straight to the side')

E('band-row', 'Band row', 'Rame avec élastique', 'pull', 'horizontal pull', ['lats', 'mid back'], ['biceps', 'rear delts'],
  ['bands'], 1, 'reps', 'horizontal-pull',
  'Anchor a band at chest height (door anchor), step back until it is tight, arms straight.',
  ['Brace the core and stand tall.', 'Pull the hands to the ribs, squeezing shoulder blades together.', 'Return with control.'],
  ['Leaning back to pull', 'Shrugging', 'Letting the band snap back'],
  'Step further back or use a thicker band to progress.',
  dict(pose=stand(100, hand=(144, 152)), over=[('band', (182, 152), 'hand', 0), ('anchor', 182, 152)]),
  dict(pose=stand(100, hand=(110, 170), ab='b'), over=[('band', (182, 152), 'hand', 0), ('anchor', 182, 152)]),
  scene=[GR, ('wall', 188, -1)])

E('kettlebell-row', 'Kettlebell row', 'Rameur avec kettlebell', 'pull', 'horizontal pull', ['lats', 'mid back'], ['biceps', 'rear delts', 'core'],
  ['kettlebell'], 2, 'reps-per-side', 'horizontal-pull',
  'Hinge forward with a flat back, knees soft, kettlebell hanging from one hand.',
  ['Keep the back flat and hips back.', 'Row the bell toward the hip, elbow close to the body.', 'Lower to a straight arm without twisting.'],
  ['Rounding the back', 'Using momentum', 'Twisting the torso'],
  'Rest the free hand on the thigh for support.',
  dict(pose=dict(hip=(78, 196), t=-35, hand=(112, 214), ab='b', foot=(96, G), fa=0, fl=8, lb='f', hd=-10), over=[('kb', 'hand', 0, 10)]),
  dict(pose=dict(hip=(78, 196), t=-35, hand=(98, 192), ab='b', foot=(96, G), fa=0, fl=8, lb='f', hd=-10), over=[('kb', 'hand', 0, 10)]),
  scene=[GR])

E('band-pull-apart', 'Band pull-apart', 'Écartement d\'élastique', 'pull', 'horizontal pull', ['rear delts', 'mid back'], ['traps', 'rotator cuff'],
  ['bands'], 1, 'reps', 'shoulder-health',
  'Hold a band at chest height with straight arms, hands shoulder-width.',
  ['Pull the band apart sideways until it touches the chest.', 'Squeeze the shoulder blades together.', 'Return slowly.'],
  ['Shrugging', 'Arching the lower back', 'Bending the elbows'],
  'Great as a warm-up or between push sets.',
  dict(pose=stand(100, hand=(144, 152), hand2=(144, 152)), over=[('band', (146, 150), (142, 154), 0)]), None, scene=[GR],
  note='side view: hands move apart sideways')

E('band-face-pull', 'Band face pull', 'Tirage visage (élastique)', 'pull', 'horizontal pull', ['rear delts', 'rotator cuff'], ['mid back', 'traps'],
  ['bands'], 2, 'reps', 'shoulder-health',
  'Anchor a band at face height, hold both ends with palms facing in, step back.',
  ['Pull the band toward the face, hands splitting to either side of the head.', 'Elbows high, finishing in a double-biceps position.', 'Return under control.'],
  ['Elbows dropping low', 'Leaning back', 'Shrugging'],
  'Light band, high reps (12-20).',
  dict(pose=stand(100, hand=(140, 128)), over=[('band', (182, 126), 'hand', 0), ('anchor', 182, 126)]),
  dict(pose=stand(100, hand=(108, 130), ab='b'), over=[('band', (182, 126), 'hand', 0), ('anchor', 182, 126)]),
  scene=[GR, ('wall', 188, -1)])

E('band-lat-pulldown', 'Band lat pulldown', 'Tirage vertical (élastique)', 'pull', 'vertical pull', ['lats'], ['biceps', 'rear delts'],
  ['bands', 'pullup-bar'], 2, 'reps', 'band-vertical-pull',
  'Loop a band over the pull-up bar, hold the ends overhead with straight arms (stand or kneel).',
  ['Pull the elbows down and back toward the ribs.', 'Squeeze the lats at the bottom.', 'Let the arms rise slowly.'],
  ['Leaning back too far', 'Shrugging', 'Using only the biceps'],
  'Step back so the band pulls down-forward for better line.',
  dict(pose=stand(100, hand=(104, 104)), over=[('band', (104, 52), 'hand', 0)]),
  dict(pose=stand(100, hand=(110, 160), ab='d'), over=[('band', (104, 52), 'hand', 6)]),
  scene=[GR, ('bar', 104, 50)])
