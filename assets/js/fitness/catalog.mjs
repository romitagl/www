import { pdfExercises, pdfCircuits } from './pdf-program.mjs';
import { demoGuides } from './demo-guides.mjs';
/** Content only. Keep exercise IDs stable: saved sessions refer to them. */
export const exercises = [
  {
    "name": "Bodyweight squat",
    "type": "Lower body",
    "muscles": "Thighs · glutes",
    "equipment": "Bodyweight",
    "dose": "10–12 reps",
    "cue": "Sit your hips back and down. Keep your whole foot grounded and knees following your toes.",
    "mistake": "Heels lifting or knees collapsing inward.",
    "easy": "Use a shallower range and a wall for balance.",
    "hard": "Hold one small dumbbell at your chest.",
    "id": "squat",
    "image": "assets/images/fitness/squat.jpg",
    "imageWidth": 1280,
    "imageHeight": 853,
    "frames": [
      "Stand tall",
      "Lower with control"
    ],
    "seconds": 0,
    "sides": false,
    "alt": "Bodyweight squat demonstrated by an adult instructor in two positions."
  },
  {
    "name": "Push-up",
    "type": "Upper body · push",
    "muscles": "Chest · shoulders · triceps",
    "equipment": "Bodyweight",
    "dose": "6–10 reps",
    "cue": "Keep your body in a straight line. Lower with control, with elbows angled back from your shoulders.",
    "mistake": "Hips sagging or elbows flaring straight out.",
    "easy": "Perform the movement standing against a wall.",
    "hard": "Lower slowly before pressing back up.",
    "id": "push-up",
    "image": "assets/images/fitness/push-up.jpg",
    "imageWidth": 1280,
    "imageHeight": 512,
    "frames": [
      "High plank",
      "Lower with control"
    ],
    "seconds": 0,
    "sides": false,
    "alt": "Push-up demonstrated by an adult instructor in two positions."
  },
  {
    "name": "One-arm dumbbell row",
    "type": "Upper body · pull",
    "muscles": "Back · arms",
    "equipment": "One small dumbbell",
    "dose": "10 each side",
    "cue": "Hinge at the hips, brace your free hand on your thigh, and draw the weight toward your hip.",
    "mistake": "Twisting your torso or shrugging your shoulder.",
    "easy": "Use a lighter weight and a comfortable hip hinge.",
    "hard": "Pause briefly at the top without rotating.",
    "id": "row",
    "image": "assets/images/fitness/row.jpg",
    "imageWidth": 1280,
    "imageHeight": 853,
    "frames": [
      "Arm extended",
      "Elbow toward hip"
    ],
    "seconds": 0,
    "sides": true,
    "alt": "One-arm dumbbell row demonstrated by an adult instructor in two positions."
  },
  {
    "name": "Glute bridge",
    "type": "Hip extension",
    "muscles": "Glutes · back of thighs",
    "equipment": "Bodyweight",
    "dose": "12 reps",
    "cue": "Plant your feet, gently brace your abdomen, and raise your hips until shoulders, hips and knees align.",
    "mistake": "Overarching the lower back at the top.",
    "easy": "Lift through a smaller comfortable range.",
    "hard": "Pause for two seconds at the top.",
    "id": "bridge",
    "image": "assets/images/fitness/bridge.jpg",
    "imageWidth": 1280,
    "imageHeight": 512,
    "frames": [
      "Hips down",
      "Lift hips"
    ],
    "seconds": 0,
    "sides": false,
    "alt": "Glute bridge demonstrated by an adult instructor in two positions."
  },
  {
    "name": "Dead bug",
    "type": "Core control",
    "muscles": "Abdominals · trunk stability",
    "equipment": "Bodyweight",
    "dose": "6 each side",
    "cue": "Lie on your back with knees bent. Slowly extend the opposite arm and leg while keeping your trunk still.",
    "mistake": "Arching your back as your leg extends.",
    "easy": "Keep arms still and move one heel toward the floor.",
    "hard": "Extend farther while keeping your lower back steady.",
    "id": "dead-bug",
    "image": "assets/images/fitness/dead-bug.jpg",
    "imageWidth": 1280,
    "imageHeight": 640,
    "frames": [
      "Tabletop position",
      "Opposite arm and leg extend"
    ],
    "seconds": 0,
    "sides": true,
    "alt": "Dead bug demonstrated by an adult instructor in two positions."
  },
  {
    "name": "Brisk marching",
    "type": "Cardio · coordination",
    "muscles": "Full body",
    "equipment": "Bodyweight",
    "dose": "45 seconds",
    "cue": "March in place with relaxed shoulders, swinging the opposite arm and keeping landings quiet.",
    "mistake": "Rushing until balance or posture breaks down.",
    "easy": "Reduce the pace and knee height.",
    "hard": "Increase the pace while staying controlled.",
    "id": "march",
    "image": "assets/images/fitness/march.jpg",
    "imageWidth": 1280,
    "imageHeight": 853,
    "frames": [
      "Left knee up",
      "Right knee up"
    ],
    "seconds": 45,
    "sides": false,
    "alt": "Brisk marching demonstrated by an adult instructor in two positions."
  },
  {
    "name": "Reverse lunge",
    "type": "Lower body · single leg",
    "muscles": "Thighs · glutes",
    "equipment": "Bodyweight or dumbbells",
    "dose": "8 each side",
    "cue": "Step back and bend both knees through a comfortable range. Push through the front foot to return.",
    "mistake": "Losing balance or allowing the front knee to collapse inward.",
    "easy": "Use a wall for support and shorten the movement.",
    "hard": "Hold small dumbbells by your sides.",
    "id": "reverse-lunge",
    "image": "assets/images/fitness/reverse-lunge.jpg",
    "imageWidth": 1280,
    "imageHeight": 640,
    "frames": [
      "Stand tall",
      "Step back and lower"
    ],
    "seconds": 0,
    "sides": true,
    "alt": "Reverse lunge demonstrated by an adult instructor in two positions."
  },
  {
    "name": "Dumbbell Romanian deadlift",
    "type": "Lower body · hip hinge",
    "muscles": "Glutes · hamstrings",
    "equipment": "Small dumbbells",
    "dose": "10–12 reps",
    "cue": "Keep knees softly bent. Send hips back with weights close to your legs, then stand tall.",
    "mistake": "Rounding your back or turning the hinge into a squat.",
    "easy": "Practice the hip hinge without weights.",
    "hard": "Use a slower lowering phase.",
    "id": "hinge",
    "image": "assets/images/fitness/hinge.jpg",
    "imageWidth": 1280,
    "imageHeight": 853,
    "frames": [
      "Stand tall",
      "Hinge from hips"
    ],
    "seconds": 0,
    "sides": false,
    "alt": "Dumbbell Romanian deadlift demonstrated by an adult instructor in two positions."
  },
  {
    "name": "Side plank",
    "type": "Core · isometric",
    "muscles": "Side abdominals · shoulders",
    "equipment": "Bodyweight",
    "dose": "15–20 sec each side",
    "cue": "Place your elbow beneath your shoulder. Lift your hips and keep your head, torso and legs aligned.",
    "mistake": "Letting the hips drop or shoulder collapse.",
    "easy": "Bend your knees and support yourself from the knees.",
    "hard": "Increase the hold while maintaining alignment.",
    "id": "side-plank",
    "image": "assets/images/fitness/side-plank.jpg",
    "imageWidth": 1280,
    "imageHeight": 640,
    "frames": [
      "Set up on your side",
      "Lift and hold"
    ],
    "seconds": 40,
    "sides": true,
    "alt": "Side plank demonstrated by an adult instructor in two positions."
  },
  {
    "name": "Suitcase hold",
    "type": "Core · grip",
    "muscles": "Grip · trunk stability",
    "equipment": "One small dumbbell",
    "dose": "20 sec each side",
    "cue": "Stand tall with one weight by your side. Keep shoulders level and breathe normally.",
    "mistake": "Leaning toward or away from the weight.",
    "easy": "Use a lighter weight or shorten the hold.",
    "hard": "March slowly without leaning.",
    "id": "suitcase-hold",
    "image": "assets/images/fitness/suitcase-hold.jpg",
    "imageWidth": 1280,
    "imageHeight": 853,
    "frames": [
      "Hold on one side",
      "Repeat on the other side"
    ],
    "seconds": 40,
    "sides": true,
    "alt": "Suitcase hold demonstrated by an adult instructor in two positions."
  },
  {
    "name": "Bird dog",
    "type": "Core · coordination",
    "muscles": "Trunk · glutes · shoulders",
    "equipment": "Bodyweight",
    "dose": "6 each side",
    "cue": "From hands and knees, reach opposite arm and leg away while keeping hips level.",
    "mistake": "Rotating the pelvis or lifting the leg too high.",
    "easy": "Move only an arm or only a leg.",
    "hard": "Pause briefly in the extended position.",
    "id": "bird-dog",
    "image": "assets/images/fitness/bird-dog.jpg",
    "imageWidth": 1280,
    "imageHeight": 640,
    "frames": [
      "Hands and knees",
      "Opposite arm and leg extend"
    ],
    "seconds": 0,
    "sides": true,
    "alt": "Bird dog demonstrated by an adult instructor in two positions."
  },
  {
    "name": "Step jacks",
    "type": "Cardio · low impact",
    "muscles": "Full body",
    "equipment": "Bodyweight",
    "dose": "45 seconds",
    "cue": "Step one foot out as your arms rise, then return and alternate sides. Keep a steady rhythm.",
    "mistake": "Moving too quickly to stay balanced.",
    "easy": "Keep your arms below shoulder height.",
    "hard": "Increase the stepping pace without jumping.",
    "id": "step-jacks",
    "image": "assets/images/fitness/step-jacks.jpg",
    "imageWidth": 1280,
    "imageHeight": 853,
    "frames": [
      "Feet together",
      "Step out and raise arms"
    ],
    "seconds": 45,
    "sides": false,
    "alt": "Step jacks demonstrated by an adult instructor in two positions."
  }
];

export const circuits = [
  {
    "id": "foundation",
    "letter": "A",
    "name": "Full-body foundation",
    "eyebrow": "Start here",
    "description": "Six simple movements for strength, control and a little cardio.",
    "equipment": "Bodyweight + one small dumbbell",
    "defaultRounds": 2,
    "exercises": [
      "squat",
      "push-up",
      "row",
      "bridge",
      "dead-bug",
      "march"
    ]
  },
  {
    "id": "rider-strength",
    "letter": "B",
    "name": "Rider strength & stability",
    "eyebrow": "Control & strength",
    "description": "A controlled circuit for legs, back, trunk stability and grip.",
    "equipment": "Bodyweight + small dumbbells",
    "defaultRounds": 2,
    "exercises": [
      "reverse-lunge",
      "hinge",
      "row",
      "push-up",
      "side-plank",
      "suitcase-hold"
    ]
  },
  {
    "id": "endurance",
    "letter": "C",
    "name": "Full-body endurance",
    "eyebrow": "Steady effort",
    "description": "Sustainable full-body effort with coordination and low-impact cardio.",
    "equipment": "Bodyweight + one small dumbbell",
    "defaultRounds": 2,
    "exercises": [
      "squat",
      "reverse-lunge",
      "push-up",
      "row",
      "bird-dog",
      "step-jacks"
    ]
  }
];

exercises.push(...pdfExercises);
circuits.push(...pdfCircuits);
for (const exercise of exercises) Object.assign(exercise, demoGuides[exercise.id] || {});

// URL and browser-storage keys must never resolve inherited Object properties.
export const exerciseById = Object.assign(Object.create(null), Object.fromEntries(exercises.map(item => [item.id, item])));
export const circuitById = Object.assign(Object.create(null), Object.fromEntries(circuits.map(item => [item.id, item])));

// Stable internal IDs preserve saved sessions; descriptive slugs are used in public URLs.
export const circuitHash = circuit => `#circuit/${circuit.slug || circuit.id}`;
export function resolveCircuitId(value) {
  if (typeof value !== 'string' || !value) return undefined;
  return circuits.find(circuit => circuit.id === value || circuit.slug === value)?.id;
}
