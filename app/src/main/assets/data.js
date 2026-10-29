// Quiz content, copied unchanged from the original website.
var G = {
  gold:"#C9962A", goldL:"#e8b84b", goldD:"#8B6914", goldT:"#D4A843",
  black:"#0a0a0a", white:"#f5f2ec",
};
var HEX = { red:"#C0392B", yellow:"#C9A800", green:"#1E8449", blue:"#1A5276" };
var BG  = { red:"#fdf2f1", yellow:"#fefdf0", green:"#f1faf4", blue:"#f0f4fb" };

var PROFILES = {
  red: {
    label:"🔴 Red — The Dominant",
    type:"The Dominant",
    tag:"Direct · Decisive · Driven",
    summary:"You are a natural leader who takes charge and gets things done. You thrive on challenge, move fast, and are at your best when you have control over outcomes. People know where they stand with you.",
    strengths:["Decisive and action-oriented","Results-focused and goal-driven","Confident under pressure","Natural at taking charge","Direct and clear communicator"],
    watchouts:["Can come across as blunt or dismissive","May move too fast for others","Can overlook the emotional impact of decisions","Tendency to take over rather than delegate","Impatience with slow processes or people"],
    motivates:["Control and autonomy","Clear targets to hit","Recognition for results","Competition and challenge","Moving fast and making things happen"],
    drains:["Indecision and bureaucracy","Being micromanaged","Slow, inefficient processes","Lack of challenge or variety","People who do not deliver"],
    workingWith:"Be direct and brief. Get to the point fast. Focus on outcomes not process. Show confidence. Do not waste their time.",
    tips:[
      { title:"Slow down to bring others with you", text:"Your pace is an asset — but it can leave your team behind. Build a habit of checking in before moving on: does the team understand, and are they with you?" },
      { title:"Separate urgency from importance", text:"Not everything needs to be solved immediately. Practise pausing on decisions that affect others and asking: what do I gain by deciding now vs tomorrow?" },
      { title:"Invest in relationships deliberately", text:"Reds often underinvest in the relational side of leadership. Schedule regular one-on-ones that are not task-focused — it builds the loyalty that makes teams perform." },
      { title:"Listen to finish, not to respond", text:"You are likely already formulating your answer before others finish speaking. Practise waiting three full seconds after someone speaks before you respond." },
      { title:"Channel competitiveness into team goals", text:"Your drive to win is powerful — make sure it is pointed outward at competitors and targets, not inward at colleagues or other teams." },
    ],
  },
  yellow: {
    label:"🟡 Yellow — The Influencer",
    type:"The Influencer",
    tag:"Enthusiastic · Sociable · Optimistic",
    summary:"You bring energy, ideas and enthusiasm wherever you go. You are a natural motivator who loves people and possibilities. At your best you inspire teams and generate real momentum — people want to follow you.",
    strengths:["Naturally enthusiastic and motivating","Creative and full of ideas","Builds rapport and relationships quickly","Great at generating buy-in","Optimistic and resilient"],
    watchouts:["Can struggle with follow-through","May avoid difficult or uncomfortable conversations","Can be disorganised and scattered","Tendency to overpromise","Can be distracted by new ideas before finishing current ones"],
    motivates:["Recognition and appreciation","Freedom and variety","Fun and social connection","Opportunities to inspire and influence","New ideas and possibilities"],
    drains:["Routine and repetition","Negativity and criticism","Being ignored or overlooked","Too much detail or admin","Rigid structures with no flexibility"],
    workingWith:"Be warm and engaging. Show enthusiasm. Give them space to share ideas. Recognise their contribution. Avoid being cold, overly critical or getting bogged down in detail.",
    tips:[
      { title:"Build a follow-through system", text:"Your ideas are valuable — the gap is execution. Create a simple weekly habit: write down your top three commitments on Monday and review them on Friday." },
      { title:"Practise the uncomfortable conversation", text:"Yellows often smooth things over instead of addressing them. The longer an issue goes unaddressed, the bigger it gets. Prepare one sentence and have the conversation early." },
      { title:"Underpromise and overdeliver", text:"Your optimism means you often commit to more than is realistic. Start saying 'let me check what I already have on' before agreeing to new things." },
      { title:"Use structure as a freedom tool", text:"Routines feel restrictive to Yellows — but a light structure actually creates more freedom. A simple daily plan means less mental noise and more energy for the things you love." },
      { title:"Deepen rather than widen", text:"You naturally build lots of relationships broadly. Invest more deeply in a smaller number of key relationships — it creates stronger trust and more influence where it matters." },
    ],
  },
  green: {
    label:"🟢 Green — The Steady",
    type:"The Steady",
    tag:"Calm · Patient · Loyal",
    summary:"You are the anchor of any team — reliable, consistent and deeply trusted. You bring stability, listen well and genuinely care about the people around you. At your best you create the psychological safety that makes teams thrive.",
    strengths:["Calm and stable under pressure","Deeply loyal and reliable","Excellent listener","Builds lasting trust with others","Creates harmony and team cohesion"],
    watchouts:["Avoids conflict even when it is needed","Can be slow to adapt to change","May suppress their own views to keep the peace","Tendency to say yes when they mean no","Can hold onto resentment rather than addressing issues"],
    motivates:["Stability and security","Harmony and cooperation","Feeling valued and appreciated","Loyalty and long-term relationships","Knowing the team is safe and settled"],
    drains:["Sudden or frequent change","Confrontation and aggression","Feeling unsupported or unappreciated","Pressure to decide quickly","Environments with constant conflict or tension"],
    workingWith:"Be patient and calm. Give them time to think and respond — do not rush them. Show that you care about them, not just their output. Give advance notice of change. Never ambush them.",
    tips:[
      { title:"Your opinion matters — share it first", text:"You often wait to see what others think before offering your view. Practise leading with your perspective: 'Here is my thinking...' Your experience and instincts are valuable." },
      { title:"Address issues early", text:"Greens tend to absorb tension rather than address it. The earlier you raise something, the easier it is. A small conversation now prevents a big problem later." },
      { title:"Get comfortable with good enough change", text:"Not all change is a threat. Practise separating 'this is genuinely bad for the team' from 'this just feels uncomfortable because it is different'." },
      { title:"Set clear boundaries", text:"Your reliability and loyalty mean others can lean on you heavily. Practise saying: 'I want to help with this — let me check what I can realistically take on right now.'" },
      { title:"Back yourself in decisions", text:"Greens often seek consensus before deciding. Practise making smaller decisions independently and noticing that the outcomes are fine — this builds confidence for bigger calls." },
    ],
  },
  blue: {
    label:"🔵 Blue — The Compliant",
    type:"The Compliant",
    tag:"Analytical · Precise · Careful",
    summary:"You bring rigour, quality and critical thinking to everything you do. You see what others miss, ask the right questions and ensure things are done properly. At your best you are the quality standard that makes teams excellent.",
    strengths:["Analytical and precise","High personal standards","Systematic and thorough","Excellent at identifying risk and errors","Asks the questions others do not think to ask"],
    watchouts:["Can over-analyse and delay decisions","May come across as cold or critical","Uncomfortable with ambiguity or uncertainty","Can get stuck in the detail at the expense of the bigger picture","Sets standards so high they are hard for others to meet"],
    motivates:["Accuracy and quality","Structure and clear processes","Time to think and analyse","Being recognised for expertise","Getting things right"],
    drains:["Being rushed into decisions","Disorganisation and poor preparation","Having to work with incomplete information","Being asked to cut corners","Environments with no standards or accountability"],
    workingWith:"Be logical and precise. Provide facts and data. Allow time to analyse — do not rush them. Respect their expertise. Avoid vague instructions or last-minute changes.",
    tips:[
      { title:"Set a decision deadline", text:"Perfect information rarely exists. Practise assigning a time limit to decisions: low stakes — 10 minutes, medium — same day, high — 48 hours. Then decide with what you have." },
      { title:"Invest in the relational side", text:"Blues can underinvest in relationships because they are task-focused. Schedule a regular informal check-in with key people — it builds the trust that makes everything else easier." },
      { title:"Communicate the why, not just the what", text:"When you raise concerns or issues, others can experience it as criticism. Frame your thinking as: 'I want this to succeed — here is a risk I think we should consider.'" },
      { title:"Zoom out regularly", text:"Your strength is in the detail — but make sure you regularly lift your head to check the direction is still right. Ask: are we doing this perfectly, or perfectly doing the wrong thing?" },
      { title:"Practise good enough", text:"Not everything needs to be done to your highest standard. Identify what truly requires excellence and what just needs to be done — and match your effort to the stakes." },
    ],
  },
};

var QUESTIONS = [
  {t:"When a new project lands on your desk, your instinct is to...",o:[{x:"Dive straight in — act fast and figure it out as you go.",c:"red"},{x:"Talk to the team, get everyone excited and brainstorm ideas.",c:"yellow"},{x:"Make sure everyone is comfortable and understands their role first.",c:"green"},{x:"Research thoroughly, map the process, and plan before acting.",c:"blue"}]},
  {t:"In a team meeting, you are most likely to...",o:[{x:"Cut to the chase and push for a decision.",c:"red"},{x:"Energise the room and get people talking.",c:"yellow"},{x:"Listen carefully and make sure quieter voices are heard.",c:"green"},{x:"Ask probing questions and point out potential issues.",c:"blue"}]},
  {t:"When someone gives you feedback or criticism, you...",o:[{x:"Take it on the chin and move on quickly — focus forward.",c:"red"},{x:"Feel it emotionally but bounce back when you get encouragement.",c:"yellow"},{x:"Process it quietly and worry whether people are upset with you.",c:"green"},{x:"Evaluate whether it is accurate and based on solid information.",c:"blue"}]},
  {t:"Your biggest frustration at work is...",o:[{x:"Slow decision-making and people who cannot keep up.",c:"red"},{x:"Routine, negativity, and lack of recognition.",c:"yellow"},{x:"Conflict, pressure, and sudden unexpected change.",c:"green"},{x:"Errors, poor preparation, and illogical thinking.",c:"blue"}]},
  {t:"How would your colleagues most likely describe you?",o:[{x:"Bold, confident, sometimes blunt.",c:"red"},{x:"Fun, enthusiastic, a bit all over the place.",c:"yellow"},{x:"Reliable, supportive, a good listener.",c:"green"},{x:"Precise, thorough, hard to rush.",c:"blue"}]},
  {t:"When you need to make a big decision, you...",o:[{x:"Trust your gut and decide quickly.",c:"red"},{x:"Talk it through with others and go with what feels right.",c:"yellow"},{x:"Take your time — you do not like being pushed.",c:"green"},{x:"Gather all the facts before committing.",c:"blue"}]},
  {t:"What motivates you most at work?",o:[{x:"Winning — achieving targets and being in control.",c:"red"},{x:"Recognition, variety and making a difference.",c:"yellow"},{x:"Harmony, loyalty and knowing the team is safe.",c:"green"},{x:"Accuracy, structure and doing things to a high standard.",c:"blue"}]},
  {t:"When there is conflict in the team, you...",o:[{x:"Address it head-on, immediately.",c:"red"},{x:"Try to lighten the mood and bring people together.",c:"yellow"},{x:"Avoid it if possible — it makes you uncomfortable.",c:"green"},{x:"Analyse what has gone wrong and look for a logical resolution.",c:"blue"}]},
  {t:"You communicate best when others...",o:[{x:"Are brief, direct and get to the point.",c:"red"},{x:"Are warm, positive and show genuine interest.",c:"yellow"},{x:"Are patient, calm and not pushy.",c:"green"},{x:"Provide facts, data and clear reasoning.",c:"blue"}]},
  {t:"Under pressure, you tend to...",o:[{x:"Get more forceful and take over.",c:"red"},{x:"Become more emotional or scattered.",c:"yellow"},{x:"Withdraw and become passive.",c:"green"},{x:"Become more rigid and critical.",c:"blue"}]},
  {t:"Your natural leadership style is...",o:[{x:"Lead from the front — I set the direction.",c:"red"},{x:"Inspire and motivate — I get people behind the vision.",c:"yellow"},{x:"Support and steady — I build trust and consistency.",c:"green"},{x:"Analyse and plan — I make sure we do it right.",c:"blue"}]},
  {t:"When it comes to change, you...",o:[{x:"Drive it — change equals opportunity.",c:"red"},{x:"Embrace it — new things excite you.",c:"yellow"},{x:"Resist it — you need time to adjust.",c:"green"},{x:"Question it — what is the evidence it will work?",c:"blue"}]},
];
