import { useLayoutEffect, useState } from 'react'
import { Container } from '../components/layout/Container'
import { Nav } from '../components/layout/Nav'
import { Section } from '../components/layout/Section'
import { Footer } from '../components/footer/Footer'
import { InteractiveBarChart } from '../components/charts/InteractiveBarChart'
import { AUTHORS, LAB } from '../data/authors'
import { SIM2REAL } from '../data/results'
import { assetUrl } from '../lib/assetUrl'
import { STORY_DIAGRAMS, type StoryDiagramId } from './storyDiagrams'
import './timeline-v2.css'

const NAV = [
  { id: 'question', label: 'Question' },
  { id: 'fdm', label: 'Dynamics model' },
  { id: 'latent', label: 'Representation' },
  { id: 'reliance', label: 'Policy use' },
  { id: 'actions', label: 'Action model' },
  { id: 'fada', label: 'FADA' },
  { id: 'evidence', label: 'Results' },
]

const chapters = [
  {
    id: 'fdm',
    date: 'Sep–Oct 2025',
    question: 'Can we adapt a dynamics model while keeping the policy fixed?',
    answer: 'No. Better prediction changed the features the policy knew how to use.',
    method: 'Forward dynamics model finetuning',
  },
  {
    id: 'latent',
    date: 'Oct–Dec 2025',
    question: 'Can we isolate dynamics from the policy that generated the data?',
    answer: 'Partly. The representation became cleaner, but control did not improve.',
    method: 'Dynamics-sensitive representation and joint training',
  },
  {
    id: 'reliance',
    date: 'Dec 2025–Feb 2026',
    question: 'What if the controller simply ignores that information?',
    answer: 'Forcing reliance exposed a deeper mismatch between prediction and action.',
    method: 'Same-policy data, FiLM, and privileged dynamics',
  },
  {
    id: 'actions',
    date: 'Feb–Mar 2026',
    question: 'Can target supervision act directly on action generation?',
    answer: 'At one step, yes. At longer horizons, adaptation became unstable.',
    method: 'Shared action and observation prediction',
  },
  {
    id: 'fada',
    date: 'Mar–May 2026',
    question: 'Which part of the controller should actually adapt?',
    answer: 'Keep motion intent fixed and adapt dynamics-dependent execution.',
    method: 'Planner–inverse dynamics model → FADA',
  },
]

const FIGURE_TITLES: Record<StoryDiagramId, string> = {
  'better-latent': 'Shape the learned feature directly',
  disentangle: 'Separate physics from data-collection style',
  'real-loop': 'Update the feature encoder with target data',
  'force-conditioning': 'Make the controller use dynamics information',
  coprediction: 'Predict motion and action with one shared model',
  'planner-idm': 'Freeze motion intent; adapt action execution',
  baseline: 'The baselines differ only in where adaptation acts',
}

const PUBLIC_SIM2REAL = {
  ...SIM2REAL,
  series: SIM2REAL.series.map((series) => ({
    ...series,
    label: series.id === 'fada_zs' ? 'FADA zero-shot' : series.label,
  })),
  groups: SIM2REAL.groups.map((group) => ({
    ...group,
    groupLabel: group.groupLabel
      .replace('G1 Loco. + Payload', 'G1 Locomotion + Payload')
      .replace('T1 Loco. + Payload', 'T1 Locomotion + Payload'),
  })),
}

function Lesson({ children }: { children: React.ReactNode }) {
  return <aside className="lesson"><span>What carried forward</span><p>{children}</p></aside>
}

function Interpretation({
  result,
  hypothesis,
  takeaway,
}: {
  result: React.ReactNode
  hypothesis: React.ReactNode
  takeaway: React.ReactNode
}) {
  return (
    <aside className="interpretation">
      <p>{result}</p>
      <p>{hypothesis}</p>
      <p>{takeaway}</p>
    </aside>
  )
}

function FrameworkFigure({ id }: { id: StoryDiagramId }) {
  const figure = STORY_DIAGRAMS[id]
  return (
    <figure className="framework-figure">
      {FIGURE_TITLES[id] && <h4>{FIGURE_TITLES[id]}</h4>}
      {figure.render()}
      <figcaption>{figure.caption}</figcaption>
    </figure>
  )
}

function EarlyPipeline() {
  return (
    <figure className="early-fdm">
      <svg viewBox="0 0 760 520" role="img" aria-labelledby="early-fdm-title early-fdm-desc">
        <title id="early-fdm-title">Source training and target adaptation with a forward dynamics model</title>
        <desc id="early-fdm-desc">
          First, a forward dynamics model is pretrained on source transitions. Second, an RL policy is
          trained to consume the source model latent. Third, target transitions update only the dynamics
          model while the same RL policy remains frozen.
        </desc>
        <defs>
          <marker id="early-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
          <marker id="early-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
          <marker id="early-arrow-update" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>

        <rect x="0" y="28" width="760" height="137" className="early-fdm__panel" />
        <text x="16" y="52" className="early-fdm__step">1 · PRETRAIN THE FDM ON SOURCE TRANSITIONS</text>
        <text x="18" y="99" className="early-fdm__input-title">History</text>
        <text x="18" y="119" className="early-fdm__data">observations + actions</text>
        <path d="M 126 109 H 165" className="early-fdm__line" markerEnd="url(#early-arrow)" />

        <rect x="168" y="78" width="112" height="64" className="early-fdm__module" />
        <text x="224" y="105" className="early-fdm__module-title">Encoder</text>
        <text x="224" y="126" className="early-fdm__module-sub">history → context</text>

        <path d="M 280 110 H 301" className="early-fdm__line" markerEnd="url(#early-arrow)" />
        <circle cx="330" cy="110" r="25" className="early-fdm__latent" />
        <text x="330" y="116" className="early-fdm__latent-label">
          z<tspan baselineShift="sub" fontSize="10">t</tspan>
        </text>
        <text x="330" y="153" className="early-fdm__latent-note">learned feature</text>

        <path d="M 355 110 H 397" className="early-fdm__line" markerEnd="url(#early-arrow)" />
        <text x="466" y="70" className="early-fdm__action-input">source action a<tspan baselineShift="sub" fontSize="8">t</tspan></text>
        <path d="M 466 73 V 77" className="early-fdm__line" markerEnd="url(#early-arrow)" />
        <rect x="400" y="78" width="132" height="64" className="early-fdm__module" />
        <text x="466" y="105" className="early-fdm__module-title">Prediction head</text>
        <text x="466" y="126" className="early-fdm__module-sub">z<tspan baselineShift="sub" fontSize="8">t</tspan> + a<tspan baselineShift="sub" fontSize="8">t</tspan> → next observation</text>

        <path d="M 532 110 H 624" className="early-fdm__line" markerEnd="url(#early-arrow)" />
        <text x="638" y="104" className="early-fdm__input-title">Prediction</text>
        <text x="638" y="124" className="early-fdm__data">next observation</text>

        <rect x="0" y="182" width="760" height="126" className="early-fdm__panel" />
        <text x="16" y="206" className="early-fdm__step">2 · TRAIN THE RL POLICY WITH THE SOURCE FDM FIXED</text>

        <rect x="32" y="230" width="156" height="58" className="early-fdm__module" />
        <text x="110" y="254" className="early-fdm__module-title">Source FDM</text>
        <text x="110" y="274" className="early-fdm__module-sub">pretrained · frozen</text>
        <path d="M 188 259 H 211" className="early-fdm__line" markerEnd="url(#early-arrow)" />
        <circle cx="238" cy="259" r="23" className="early-fdm__latent" />
        <text x="238" y="265" className="early-fdm__latent-label">
          z<tspan baselineShift="sub" fontSize="10">t</tspan>
        </text>
        <text x="238" y="297" className="early-fdm__latent-note">source feature</text>

        <path d="M 261 259 H 356" className="early-fdm__latent-line" markerEnd="url(#early-arrow-accent)" />
        <rect x="360" y="230" width="190" height="58" className="early-fdm__policy" />
        <text x="455" y="254" className="early-fdm__module-title">Learned RL policy</text>
        <text x="455" y="274" className="early-fdm__module-sub">current observation + source z<tspan baselineShift="sub" fontSize="8">t</tspan></text>
        <path d="M 550 259 H 648" className="early-fdm__line" markerEnd="url(#early-arrow)" />
        <text x="662" y="265" className="early-fdm__data">action a<tspan baselineShift="sub" fontSize="8">t</tspan></text>

        <rect x="0" y="328" width="760" height="172" className="early-fdm__panel early-fdm__panel--target" />
        <text x="16" y="354" className="early-fdm__step">3 · FINETUNE ONLY THE FDM ON TARGET TRANSITIONS</text>

        <rect x="22" y="386" width="150" height="68" className="early-fdm__module early-fdm__module--data" />
        <text x="97" y="410" className="early-fdm__module-title">Target transitions</text>
        <text x="97" y="430" className="early-fdm__module-sub">history + action</text>
        <text x="97" y="443" className="early-fdm__module-sub">observed next state</text>
        <path d="M 172 420 H 211" className="early-fdm__adapt-line" markerEnd="url(#early-arrow-update)" />
        <text x="191" y="378" className="early-fdm__adapt-label" textAnchor="middle">supervised update</text>

        <rect x="215" y="386" width="165" height="68" className="early-fdm__module early-fdm__module--update" />
        <text x="297.5" y="410" className="early-fdm__module-title">Same FDM</text>
        <text x="297.5" y="434" className="early-fdm__module-sub">encoder + head update</text>

        <path d="M 380 420 H 408" className="early-fdm__latent-line" markerEnd="url(#early-arrow-accent)" />
        <circle cx="435" cy="420" r="23" className="early-fdm__latent" />
        <text x="435" y="426" className="early-fdm__latent-label">
          z<tspan baselineShift="sub" fontSize="10">t</tspan>
        </text>
        <text x="435" y="461" className="early-fdm__latent-note">changed feature</text>

        <path d="M 458 420 H 496" className="early-fdm__latent-line" markerEnd="url(#early-arrow-accent)" />
        <rect x="500" y="386" width="170" height="68" className="early-fdm__policy" />
        <text x="585" y="410" className="early-fdm__module-title">Same RL policy</text>
        <text x="585" y="434" className="early-fdm__frozen">weights remain frozen</text>
        <path d="M 670 420 H 718" className="early-fdm__line" markerEnd="url(#early-arrow)" />
        <text x="730" y="426" className="early-fdm__data">a<tspan baselineShift="sub" fontSize="8">t</tspan></text>

        <text x="215" y="484" className="early-fdm__mismatch">
          same policy, but a different latent distribution
        </text>
      </svg>
      <div
        className="early-fdm-mobile"
        role="img"
        aria-label="First pretrain the forward dynamics model. Then train the RL policy with the source model fixed. Finally update only the dynamics model on target transitions while the same policy remains frozen."
      >
        <div className="early-fdm-mobile__stage">
          <small>1 · Source pretraining</small>
          <b>Pretrain the forward dynamics model</b>
          <p>Observation/action history + source action</p>
          <div className="early-fdm-mobile__flow">
            <span>Encoder</span>
            <i>→</i>
            <strong>z_t</strong>
            <i>→</i>
            <span>Prediction head</span>
          </div>
          <p>Supervise the predicted next observation.</p>
        </div>
        <div className="early-fdm-mobile__stage">
          <small>2 · Policy training</small>
          <b>Train the policy with the source FDM fixed</b>
          <div className="early-fdm-mobile__flow">
            <span>Source FDM</span>
            <i>→</i>
            <strong>z_t</strong>
            <i>→</i>
            <span>RL policy</span>
          </div>
          <p>The policy learns to interpret this source feature.</p>
        </div>
        <div className="early-fdm-mobile__stage early-fdm-mobile__stage--target">
          <small>3 · Target adaptation</small>
          <b>Update only the FDM with target transitions</b>
          <div className="early-fdm-mobile__flow">
            <span>Updated FDM</span>
            <i>→</i>
            <strong>z_t</strong>
            <i>→</i>
            <span>Same policy</span>
          </div>
          <p>The latent changes; the policy weights stay frozen.</p>
        </div>
      </div>
      <figcaption>
        The experiment had three stages: pretrain the FDM, train the RL policy to use the source
        FDM latent, then finetune only the FDM on target transitions. The policy weights stayed fixed
        while the distribution of its latent input changed.
      </figcaption>
    </figure>
  )
}

function FdmEvidence() {
  return (
    <figure className="fdm-evidence">
      <header>
        <div>
          <span>Booster T1 slope transfer</span>
          <b>Source FDM → target-finetuned FDM</b>
        </div>
        <small>Lower is better</small>
      </header>
      <div className="fdm-evidence__metrics">
        <article>
          <span>FDM reconstruction loss</span>
          <p>
            <b>0.4698</b>
            <i>→</i>
            <strong>0.4641</strong>
          </p>
          <small>1.2% lower</small>
        </article>
        <article>
          <span>Frozen-policy linear tracking error</span>
          <p>
            <b>0.1460</b>
            <i>→</i>
            <strong>0.1614</strong>
          </p>
          <small>10.5% higher</small>
        </article>
      </div>
      <figcaption>
        For the same target setting, the dynamics model became a better predictor while the frozen
        controller tracked the command less accurately.
      </figcaption>
    </figure>
  )
}

const rankData = {
  prediction: [['Target-prediction finetune', 1], ['Unchanged source FDM', 2], ['Policy-objective diagnostic', 3]],
  policy: [['Policy-objective diagnostic', 1], ['Unchanged source FDM', 2], ['Target-prediction finetune', 3]],
} as const

function RankFigure() {
  const [mode, setMode] = useState<keyof typeof rankData>('prediction')
  return (
    <figure className="rank figure-card">
      <div className="switch" role="group" aria-label="Choose ranking">
        <button className={mode === 'prediction' ? 'active' : ''} onClick={() => setMode('prediction')}>Prediction quality</button>
        <button className={mode === 'policy' ? 'active' : ''} onClick={() => setMode('policy')}>Policy performance</button>
      </div>
      <div className="rank__rows">
        {rankData[mode].map(([label, rank]) => (
          <div className="rank__row" key={label}>
            <span>{label}</span><div><i style={{ width: `${100 - Number(rank) * 22}%` }} /></div><b>#{rank}</b>
          </div>
        ))}
      </div>
      <figcaption>The ranking reverses with the evaluation metric: the best predictor is not the best controller pairing.</figcaption>
    </figure>
  )
}

const latent = {
  dynamics: { title: 'Separation across physics', note: 'Larger means physics conditions are easier to distinguish', values: [2.1, 5, 50.7], max: 55 },
  policy: { title: 'Separation across policy styles', note: 'Smaller means less information about the collection policy', values: [45.5, 31.1, 7.1], max: 50 },
}

function LatentChart() {
  const [mode, setMode] = useState<keyof typeof latent>('dynamics')
  const data = latent[mode]
  return (
    <figure className="latent figure-card">
      <div className="figure-card__head"><div><b>{data.title}</b><small>{data.note}<br />Maximum mean discrepancy (MMD)</small></div>
        <div className="switch"><button className={mode === 'dynamics' ? 'active' : ''} onClick={() => setMode('dynamics')}>Physics change</button><button className={mode === 'policy' ? 'active' : ''} onClick={() => setMode('policy')}>Policy change</button></div>
      </div>
      {['Input histories', 'Prediction objective', 'Prediction + contrastive objectives'].map((label, i) => (
        <div className="latent__row" key={label}><span>{label}</span><div><i style={{ width: `${data.values[i]! / data.max * 100}%` }} /></div><b>{data.values[i]}</b></div>
      ))}
      <figcaption>Contrastive training made the representation more dynamics-sensitive and less policy-specific, but did not reliably improve control.</figcaption>
    </figure>
  )
}

function RepresentationEvidence() {
  return (
    <figure className="tsne-figure">
      <header>
        <div>
          <span>Feature-space evidence</span>
          <b>The feature separated collection policies more clearly than physical environments</b>
        </div>
      </header>
      <div className="tsne-panels">
        <article>
          <span>Change the terrain</span>
          <b>Plane and rough-terrain samples overlap</b>
          <img
            src={assetUrl('timeline-v2/latent-environment-overlap.png')}
            alt="Two-dimensional t-SNE plot in which plane and rough-terrain features largely overlap"
          />
          <p>The encoder did not clearly separate the physical environments we wanted it to identify.</p>
        </article>
        <article>
          <span>Change the collecting policy</span>
          <b>Policy checkpoints form distinct regions</b>
          <img
            src={assetUrl('timeline-v2/latent-policy-clusters.png')}
            alt="Two-dimensional t-SNE plot in which features from different policy checkpoints form distinct regions"
          />
          <p>The same encoder exposed a strong signature of which policy had generated the rollout.</p>
        </article>
      </div>
      <figcaption>t-SNE projects high-dimensional features into two dimensions for qualitative inspection; distances are not a control metric. This diagnostic motivated the attempts to separate physical dynamics from data-collection style.</figcaption>
    </figure>
  )
}

const masses = [
  { label: 'Nominal', truth: 11.7, linear: 11.13, angular: 12.01, tuned: 12.737 },
  { label: '+3 kg', truth: 14.7, linear: 12.055, angular: 14.096, tuned: 15.947 },
  { label: '+7 kg', truth: 18.7, linear: 13.646, angular: 16.289, tuned: 19.113 },
]

function MassFigure() {
  const [index, setIndex] = useState(0)
  const d = masses[index]!
  const points = [['Mass input with best linear tracking', d.linear], ['Mass input with best angular tracking', d.angular], ['True physical mass', d.truth], ['Prediction-derived mass estimate', d.tuned]] as const
  return (
    <figure className="mass figure-card">
      <div className="switch">{masses.map((m, i) => <button key={m.label} className={i === index ? 'active' : ''} onClick={() => setIndex(i)}>{m.label}</button>)}</div>
      <div className="mass__axis"><span>10 kg</span><span>20 kg</span></div>
      {points.map(([label, value], i) => <div className="mass__row" key={label}><span>{label}</span><div><i className={`p${i}`} style={{ left: `${(value - 10) * 10}%` }} /></div><b>{value.toFixed(2)}</b></div>)}
      <figcaption>The true mass, the mass estimate preferred by the prediction objective, and the mass inputs that produced the best control were different points.</figcaption>
    </figure>
  )
}

function PpoShift() {
  return (
    <figure className="ppo-explainer figure-card">
      <header>
        <span>Why naïve joint training was unstable</span>
        <b>PPO expects a stored rollout to keep the same policy inputs during optimization</b>
      </header>
      <div className="ppo-explainer__flow">
        <article>
          <small>1 · Collect the rollout</small>
          <div className="ppo-explainer__pipeline">
            <span>Stored observation</span><i>→</i><span>Dynamics model</span><i>→</i><strong>Feature during rollout</strong><i>→</i><span>Policy</span>
          </div>
          <p>The action and its probability are stored in the PPO batch.</p>
        </article>
        <div className="ppo-explainer__update"><b>Update the dynamics model</b><span>The encoder changes before PPO reuses the batch.</span></div>
        <article className="ppo-explainer__problem">
          <small>2 · Optimize PPO on the stored rollout</small>
          <div className="ppo-explainer__pipeline">
            <span>Same observation</span><i>→</i><span>Updated model</span><i>→</i><strong>Different feature</strong><i>→</i><span>Same policy</span>
          </div>
          <p>PPO now recomputes the action probability from a different input, not merely different policy weights.</p>
        </article>
      </div>
      <div className="ppo-explainer__conclusion">The representation must stay fixed during a PPO update, or be trained in a separate stage.</div>
      <figcaption>Proximal Policy Optimization (PPO) compares action probabilities before and after an update on the same rollout. Updating the feature encoder in between adds an unaccounted input change to that comparison.</figcaption>
    </figure>
  )
}

function CoPrediction() {
  const [mode, setMode] = useState<'one' | 'long'>('one')
  return (
    <figure className="copred figure-card">
      <div className="switch"><button className={mode === 'one' ? 'active' : ''} onClick={() => setMode('one')}>One-step horizon · hardware</button><button className={mode === 'long' ? 'active' : ''} onClick={() => setMode('long')}>Ten-step horizon · MuJoCo</button></div>
      {mode === 'one' ? (
        <div className="metrics"><div><span>Linear-velocity tracking error</span><b>0.218 → 0.184</b></div><div><span>Angular-velocity tracking error</span><b>0.416 → 0.220</b></div><div><span>Observation-prediction error</span><b>415 → 132</b></div></div>
      ) : (
        <div className="metrics"><div><span>Before adaptation · linear / angular</span><b>0.147 / 0.203</b></div><div className="bad"><span>Full finetuning</span><b>Robot falls</b></div><div><span>Earlier checkpoint · linear / angular</span><b>0.179 / 0.350</b></div></div>
      )}
      <figcaption>Sharing action and observation prediction helped at a one-step horizon. At ten steps, prediction error still decreased while control became worse.</figcaption>
    </figure>
  )
}

function FadaOverview() {
  return (
    <figure className="fada-overview">
      <header>
        <span>FADA at a glance</span>
        <b>Keep the motion plan fixed; adapt the module that turns motion into action</b>
      </header>
      <div className="fada-overview__steps">
        <article><small>Source training</small><b>Teacher policy supplies action labels</b><p>Simulation provides commands, realized motion, and the actions that produced it.</p></article>
        <article><small>Factorize control</small><b>Planner → inverse dynamics model</b><p>The planner proposes intended motion. The inverse dynamics model converts that motion into the next action.</p></article>
        <article><small>Collect target rollouts</small><b>Observe motion and executed actions</b><p>A short hardware rollout provides supervised pairs without rewards or exploration.</p></article>
        <article className="fada-overview__adapt"><small>Adaptation</small><b>Freeze the planner; update execution</b><p>A low-rank update changes only the inverse dynamics model.</p></article>
      </div>
      <figcaption>Inverse dynamics model (IDM): the component that maps intended motion and recent execution history to an action. Low-rank adaptation (LoRA) updates a small set of IDM parameters.</figcaption>
    </figure>
  )
}

function PlannerEvidence() {
  const rows = [
    { label: 'Linear-velocity error', short: '0.744', long: '0.302', note: '59% lower' },
    { label: 'Angular-velocity error', short: '0.729', long: '0.223', note: '69% lower' },
    { label: 'Execution-model loss', short: '0.0010', long: '0.0033', note: '3.2× higher' },
  ]
  return (
    <figure className="planner-evidence">
      <header>
        <span>Planner–execution diagnostic</span>
        <b>More motion context improved control even though the supervised loss increased</b>
      </header>
      <div className="planner-evidence__head">
        <span>Metric</span><span>1 future step</span><span>10 future steps</span><span>Change</span>
      </div>
      {rows.map((row, index) => (
        <div className={`planner-evidence__row${index === 2 ? ' planner-evidence__row--mismatch' : ''}`} key={row.label}>
          <b>{row.label}</b><span>{row.short}</span><strong>{row.long}</strong><em>{row.note}</em>
        </div>
      ))}
      <figcaption>Lower tracking error is better; lower execution-model loss is also better. The ten-step motion window controlled much better despite having a higher supervised loss, another sign that model loss alone was not the deployment objective.</figcaption>
    </figure>
  )
}

export function TimelineV2Page() {
  useLayoutEffect(() => {
    if (window.location.hash) {
      document.querySelector(window.location.hash)?.scrollIntoView()
    }
  }, [])

  return (
    <>
      <Nav items={NAV} brandHref="./" brandLabel="FADA" />
      <header className="story-hero dark" id="top"><div className="story-hero__grid" /><Container width="wide">
        <div className="story-hero__layout">
          <div className="story-hero__copy">
            <p className="story-hero__date">September 2025—May 2026</p>
            <h1>Timeline: The story behind FADA</h1>
            <p className="story-hero__dek">How a sequence of adaptation ideas moved us from finetuning a dynamics representation to finetuning the part of a humanoid controller that actually realizes motion.</p>
            <p className="story-byline">{AUTHORS.map((a, i) => <span key={a.name}>{i > 0 && ', '}<a href={a.url}>{a.name}</a></span>)}<small>{LAB.name}, {LAB.institution}</small></p>
          </div>
          <figure className="story-hero__machine">
            <p>The interface we eventually kept</p>
            {STORY_DIAGRAMS['planner-idm'].render()}
            <figcaption>Task intent stays fixed. Target data changes only how that intent becomes action.</figcaption>
          </figure>
        </div>
      </Container></header>

      <main>
        <Section id="question" eyebrow="The question" title="Can we adapt part of a humanoid whole-body controller from real-world rollouts using only supervised learning?" width="text" className="prose intro-v2">
          <p>Real-world dynamics never match simulation exactly. Payload, contact, terrain, and actuator response can all change how the same command is realized. Real-world reinforcement learning (RL) can specialize a policy, but on a humanoid it also brings reward design, resets, safe exploration, and a costly hardware optimization loop.</p>
          <p>We wanted to explore a narrower alternative: adapt part of a neural controller from ordinary target-domain rollouts, make it account for the real dynamics better, and use supervised learning alone. This blog follows the research directions we tried, how each result changed the next method, and the lessons that led to FADA.</p>
        </Section>

        <Container width="wide"><div className="compare"><table><thead><tr><th></th><th>System identification</th><th>Model-based control</th><th>Real-world RL</th><th>FADA</th></tr></thead><tbody>
          <tr><th>What changes</th><td>Dynamics parameters</td><td>Model or online plan</td><td>Whole policy</td><td>Execution module</td></tr>
          <tr><th>Hardware signal</th><td>Measured transitions</td><td>Transitions, cost</td><td>Task reward</td><td>Actions + observed motion</td></tr>
          <tr><th>Adaptation loop</th><td>Identify, then control</td><td>Repeated online solve</td><td>Collect, optimize, evaluate</td><td>Roll out, then supervised finetune</td></tr>
          <tr><th>Main constraint</th><td>Model identifiability</td><td>Model and online optimization</td><td>Rewards, safety, resets, samples</td><td>Loss must match the module’s role</td></tr>
        </tbody></table></div></Container>

        <Container width="wide">
          <section className="chapter-index" aria-labelledby="chapter-index-title">
            <header>
              <p>Research map</p>
              <h2 id="chapter-index-title">Five questions that changed the controller</h2>
              <span>Each phase begins with the limitation exposed by the one before it.</span>
            </header>
            <nav className="chapter-map" aria-label="Research directions">
              {chapters.map((chapter, i) => (
                <a href={`#${chapter.id}`} key={chapter.id}>
                  <span>0{i + 1}</span>
                  <small>{chapter.date}</small>
                  <b>{chapter.question}</b>
                  <em>{chapter.answer}</em>
                  <i>{chapter.method}</i>
                </a>
              ))}
            </nav>
          </section>
        </Container>

        <Section id="fdm" eyebrow="Sep–Oct 2025 · Direction 01" title="First, adapt the forward dynamics model and keep the policy fixed" intro="The initial idea was modular: learn a forward dynamics model, feed its latent to a learned RL policy, then update the dynamics model with target-domain transitions while keeping the policy fixed." width="wide" className="story-section">
          <aside className="prior-work">
            <p>
              <b>Connection to prior work.</b>{' '}
              Latent-conditioned locomotion policies were already well established.{' '}
              <a href="https://arxiv.org/abs/2107.04034" target="_blank" rel="noopener noreferrer">
                RMA
              </a>{' '}
              trains a policy to consume a privileged environment encoding, then trains a history-based
              adaptation module to estimate that encoding at deployment.{' '}
              <a href="https://arxiv.org/abs/2301.10602" target="_blank" rel="noopener noreferrer">
                DreamWaQ
              </a>{' '}
              is closer to our starting point: its context-aided estimator learns a latent from recent
              proprioception using next-observation reconstruction, and the RL policy consumes that latent.
              Both methods train their adaptation machinery in simulation and deploy without target-domain
              finetuning. Our question was whether the dynamics-producing module itself could instead be
              updated from target rollouts while the learned policy stayed fixed.
            </p>
            <ol>
              <li>
                A. Kumar, Z. Fu, D. Pathak, and J. Malik, “RMA: Rapid Motor Adaptation for Legged Robots,”
                RSS 2021.
              </li>
              <li>
                I. M. A. Nahrendra, B. Yu, and H. Myung, “DreamWaQ: Learning Robust Quadrupedal Locomotion
                With Implicit Terrain Imagination via Deep Reinforcement Learning,” 2023.
              </li>
            </ol>
          </aside>
          <div className="two-col two-col--fdm"><div className="prose"><p>We pretrained a forward dynamics model (FDM) to predict the next observation from observation and action history. Its learned internal feature—often called a latent—was concatenated directly to an RL policy. On the target robot, we finetuned the FDM and reconnected it to the frozen policy.</p><p>We then evaluated the frozen policy with the source FDM, a fully target-finetuned FDM, regularized variants, and FDMs trained on the target from scratch. The result below captures the recurring pattern: prediction improved while control became worse.</p></div><EarlyPipeline /></div>
          <FdmEvidence />
          <div className="two-col"><div className="prose"><h3>Was prediction quality actually the problem?</h3><p>The model-swap experiments left two possible explanations. The target-finetuned FDM might still be too inaccurate, or it might be a better predictor whose learned feature had moved away from the distribution understood by the frozen policy.</p><p>To separate them, we froze the policy and value networks and updated only the FDM encoder using the policy objective. If prediction quality were the main issue, the encoder with the lowest prediction loss should also have controlled best. Instead, the ordering reversed.</p></div><RankFigure /></div>
          <Interpretation
            result={<>The swap experiments and this diagnostic pointed in the same direction. Full offline finetuning gave the best dynamics predictions and the weakest controller pairing; updating the encoder with the policy objective predicted worse, but stayed close to the unchanged source encoder in control.</>}
            hypothesis={<>The policy had not learned to read an abstract, interchangeable description of dynamics. It had learned the activation pattern produced by one particular FDM. Finetuning added target information, but delivered it through features the frozen policy no longer knew how to interpret.</>}
            takeaway={<>That changed the next question. Instead of asking only how to improve the dynamics model, we needed to ask whether its representation could be made stable, dynamics-sensitive, and useful to the policy.</>}
          />
          <Lesson>Distribution mismatch. The policy had learned to use one particular FDM’s activations—not an interchangeable description of physics.</Lesson>
        </Section>

        <Section id="latent" eyebrow="Oct–Dec 2025 · Directions 02–03" title="A cleaner learned feature still was not a control objective" intro="We next tried to isolate dynamics information and then let the representation and policy learn a compatible interface together." tone="dark" width="wide" className="story-section">
          <div className="two-col"><div className="prose"><h3>Make the feature about physics, not policy style</h3><p>Contrastive supervision, normalization, longer prediction horizons, and several disentangling architectures all pursued the same target: change the feature when physics changes, but not when the policy that collected the data changes.</p><p>The representation diagnostics improved sharply. Control did not. Encoding dynamics information was achievable; getting the controller to use it, and ensuring target adaptation moved it in a useful direction, were separate problems.</p></div><LatentChart /></div>
          <Interpretation
            result={<>Contrastive training increased dynamics separation by roughly an order of magnitude and removed most measured policy information. Architectural disentangling also reduced prediction error under an out-of-distribution collection policy. Neither produced a reliable control gain.</>}
            hypothesis={<>The latent work improved the supply side of the interface: the encoder produced cleaner information. PPO was still free to ignore that structure, especially under domain randomization, and target finetuning happened on a different data distribution from representation pretraining.</>}
            takeaway={<>A useful adaptation variable needs three properties at once: it must contain dynamics information, the controller must use it, and the target update must move it in a direction that improves actions. Representation metrics tested only the first.</>}
          />
          <RepresentationEvidence />
          <div className="framework-grid">
            <FrameworkFigure id="better-latent" />
            <FrameworkFigure id="disentangle" />
          </div>
          <div className="prose prose--wide"><h3>Train the dynamics model and policy together</h3><p>Co-training removed the expectation that a separately learned representation would be plug-compatible. The difficulty was procedural: naïve schedules updated the feature encoder after collecting a rollout but before optimizing the policy on that rollout.</p><p>That matters for Proximal Policy Optimization (PPO), which compares old and new action probabilities on the same stored data. If the feature changes between those two evaluations, the comparison no longer holds the policy input fixed.</p></div>
          <PpoShift />
          <figure className="slide-plot">
            <div className="slide-plot__head"><b>Linear tracking reward</b><b>Angular tracking reward</b></div>
            <img src={assetUrl('timeline-v2/co-training-curves-public.png')} alt="Linear and angular tracking reward curves comparing PPO-only training with several FDM-policy co-training schedules" />
            <figcaption>The magenta curve is the standard PPO controller with no dynamics-model update. Joint and alternating schedules are the other colors; every tested schedule remained substantially lower.</figcaption>
          </figure>
          <Interpretation
            result={<>Combined and alternating dynamics-model–PPO updates trained below PPO-only. Updating the encoder through PPO was worse, and changing the FDM before the policy update was especially brittle.</>}
            hypothesis={<>A rollout was collected with <i>z</i><sub>old</sub>, then the FDM changed before PPO recomputed the action probabilities. The same stored observation now produced <i>z</i><sub>new</sub>, so PPO’s ratio mixed a policy update with an unaccounted input update.</>}
            takeaway={<>The update schedule is part of the method. Representation learning and on-policy control cannot be combined as two ordinary losses sharing a backbone; the policy-facing interface must remain stable during the PPO update.</>}
          />
          <Lesson>Training harmony. A learned representation cannot move freely inside an on-policy update; the controller needs a stable interface.</Lesson>
        </Section>

        <Section id="reliance" eyebrow="Dec 2025–Feb 2026 · Directions 04–05" title="Making the policy listen did not tell adaptation where to move" intro="Same-policy data reduced one source of shift. Observation noise and feature-wise linear modulation made the controller depend more strongly on the learned feature. Neither resolved the objective mismatch." width="wide" className="story-section">
          <div className="two-col"><div className="prose"><p>With strong domain randomization, the policy could often ignore the FDM feature. Removing it barely changed behavior. Observation noise made raw proprioception less sufficient; feature-wise linear modulation (FiLM) injected the feature throughout the policy network, making it harder to bypass.</p><p>That solved the reliance problem, but exposed the next one. A policy that listens more closely is also more sensitive when finetuning moves the representation in the wrong direction.</p><h3>A privileged-information diagnostic</h3><p>We then supplied ground-truth physical parameters during training and learned to estimate them from history. Even here, the true value, the prediction-optimal estimate, and the value that gave the best control were not the same.</p></div><MassFigure /></div>
          <Interpretation
            result={<>FiLM and observation noise made latent dependence measurable, but no tested configuration improved both linear and angular tracking consistently. With privileged mass, the encoder could recover the physical value near its training range, yet prediction finetuning could move the estimate toward truth while reducing return.</>}
            hypothesis={<>Domain randomization encouraged a conservative shortcut: trust the raw observations and treat the latent as optional. Forcing dependence removed that shortcut but did not align the update. At larger shifts, a correct latent could also describe a regime for which the policy had never learned a useful response.</>}
            takeaway={<>Reliance is necessary, not sufficient. Correct dynamics information, minimum prediction loss, and the best input for a particular learned controller are not automatically the same point.</>}
          />
          <div className="framework-grid">
            <FrameworkFigure id="real-loop" />
            <FrameworkFigure id="force-conditioning" />
          </div>
          <Lesson>Objective mismatch. Lower next-state prediction loss—even with privileged supervision—was not a reliable proxy for better actions.</Lesson>
        </Section>

        <Section id="actions" eyebrow="Feb–Mar 2026 · Direction 06" title="Move adaptation closer to action generation" intro="A shared Transformer predicted both actions and future observations. Target observation prediction now updated parameters that directly participated in action prediction." tone="dark" width="wide" className="story-section">
          <div className="two-col"><div className="prose"><p>The one-step model gave the first clear sign that this direction could work: after supervised target adaptation, both tracking errors and observation-prediction error improved on the real robot.</p><p>Longer horizons exposed the remaining weakness. Prediction error could fall while the controller became worse or fell. Shared parameters made adaptation more direct, but did not make the two objectives identical.</p></div><CoPrediction /></div>
          <Interpretation
            result={<>At horizon one, adaptation improved real-robot linear tracking by 15.8%, angular tracking by 47.1%, and prediction error by 68.2%. At horizon ten, prediction error still fell, but tracking worsened and the fully finetuned policy fell.</>}
            hypothesis={<>One parameter set still performed two jobs. Updating it for observation prediction dragged action generation along. Longer open-loop horizons compounded prediction errors and spent model capacity on futures that deployment did not execute.</>}
            takeaway={<>The promising part was not simply “predict observations and actions together.” It was moving supervision closer to action generation. The next architecture needed to preserve task intent while isolating the dynamics-sensitive execution path.</>}
          />
          <div className="framework-grid framework-grid--single">
            <FrameworkFigure id="coprediction" />
          </div>
          <Lesson>Direct coupling helped, but the same backbone still mixed two jobs: deciding the intended motion and executing it under the current dynamics.</Lesson>
        </Section>

        <Section id="fada" eyebrow="Mar–May 2026 · Directions 07–08" title="The final pivot: preserve intent, adapt execution" intro="The controller was split into a planner for motion intent and an inverse dynamics model for dynamics-sensitive action execution." width="wide" className="story-section">
          <div className="two-col"><div className="prose"><p>The first Planner–IDM versions were not enough. The inverse dynamics model (IDM) could reduce its supervised loss while tracking stayed flat or worsened, because it could copy easy future-state signals instead of learning how recent execution and intended motion determine the next action.</p><p>The source-training interface changed: teacher forcing used motion the robot actually realized; masking and noise removed shortcuts; only the first action—the one deployment executes before replanning—was supervised; and the planner was trained through the IDM so that its proposed motion produced the teacher policy’s action.</p><p>At deployment, the planner stays fixed. Ordinary target rollouts provide paired actions and observed motion, and low-rank adaptation (LoRA) updates only the IDM.</p></div><FadaOverview /></div>
          <Interpretation
            result={<>Early Planner–IDM had weaker absolute zero-shot numbers, but unlike the shared co-prediction model it did not become unsafe after adaptation. Its central failure was more revealing: IDM loss could fall substantially while angular tracking became worse.</>}
            hypothesis={<>The planner and IDM were trained separately and then expected to compose. Without masking, the IDM could also copy predicted joint positions and largely ignore the observation/action history that carried evidence about the actual dynamics.</>}
            takeaway={<>Choosing the right module to adapt was not enough. Source training had to prevent shortcuts and make the target supervised objective describe the same inverse-dynamics relation used at deployment.</>}
          />
          <PlannerEvidence />
          <div className="changes"><div><b>Masking + noise</b><span>More robust zero-shot transfer</span></div><div><b>First-action supervision</b><span>Large zero-shot improvement</span></div><div><b>Action-based planner loss</b><span>Large zero-shot improvement</span></div><div><b>LoRA on the IDM</b><span>Small, targeted deployment update</span></div></div>
          <Interpretation
            result={<>Masking, first-action supervision, and the action-based planner loss produced the largest gains in our ablations. Delta prediction and additional data collected from weaker policies showed no obvious effect.</>}
            hypothesis={<>The successful changes all removed a way to cheat. Teacher forcing taught pure inverse dynamics; masking forced the IDM to use execution history; first-action supervision matched the receding-horizon controller; and the planner loss rewarded futures for producing the right action rather than merely resembling an oracle trajectory.</>}
            takeaway={<>This was the first interface where the quantity optimized during adaptation and the quantity deployment depended on were the same: the target-domain relation between realized motion and the action that produced it.</>}
          />
          <Lesson>The adaptable component and its supervised target must describe the same job: translating intended motion into actions under the target dynamics.</Lesson>
        </Section>

        <Section id="evidence" eyebrow="Where the path landed" title="The interface survived contact with hardware" intro="The final method improved both success-based and tracking-error tasks after a short target rollout budget." tone="dark" width="wide" className="story-section results-v2">
          <div className="result-grid"><div><h3>Success tasks</h3><InteractiveBarChart dataset={PUBLIC_SIM2REAL} metricFilter="success" /></div><div><h3>Tracking tasks</h3><InteractiveBarChart dataset={PUBLIC_SIM2REAL} metricFilter="normErr" /></div></div>
          <Interpretation
            result={<>FADA improved performance across the evaluated hardware tasks after adaptation. The most informative comparison was the adapted shared-prediction model: it used the same target data but applied the update to future prediction rather than action execution.</>}
            hypothesis={<>When the domain shift changes how intended motion is realized, the update belongs where actions are generated. The teacher policy, source data, target-data budget, and deployment observations were held fixed, isolating the interface that received the update.</>}
            takeaway={<>A supervised adaptation objective helps when it trains the role deployment actually needs. Adapting a quantity the controller may ignore, or optimizing a proxy only loosely connected to action quality, is not enough.</>}
          />
          <div className="framework-grid framework-grid--single">
            <FrameworkFigure id="baseline" />
          </div>
          <div className="closing-copy"><p>The path to FADA was not a search for a more accurate latent. It was a search for an interface where the data available on hardware teaches exactly the part of the policy that needs to change.</p><a href="./">Read the FADA paper and full results →</a></div>
          <details className="open-questions">
            <summary>What remains unresolved</summary>
            <ul>
              <li>The planner is intended to be dynamics-invariant; the experiments do not establish that it must be.</li>
              <li>The Planner–IDM controller can begin below the teacher policy before adaptation. FADA addresses target-domain dynamics, not every gap inherited from source training.</li>
              <li>Adaptation remains sensitive to data volume and optimization settings across robots and payloads.</li>
              <li>Weaker zero-shot controllers often show larger gains, so adaptation improvements must be read together with absolute performance.</li>
              <li>The tested shifts are dynamic—payload, terrain, and actuator response. Morphological changes may also invalidate the frozen planner.</li>
            </ul>
          </details>
        </Section>
      </main>
      <Footer />
    </>
  )
}
