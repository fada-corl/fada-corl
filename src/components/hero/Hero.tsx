import { SITE, HERO_STATS } from '../../data/content'
import { assetUrl } from '../../lib/assetUrl'
import { Container } from '../layout/Container'
import './hero.css'

const TONE_VAR: Record<NonNullable<(typeof HERO_STATS)[number]['tone']>, string> = {
  baseline: 'var(--c-baseline)',
  zeroshot: 'var(--c-zeroshot)',
  adapted: 'var(--c-adapted)',
  neutral: 'var(--chalk-soft)',
}

/**
 * The hero is a dark "showcase" band: it sets the FADA identity, expands the
 * acronym, states the one-line thesis, and shows three headline stats. Robot
 * footage colors (red/amber/green) recur as accents.
 */
export function Hero() {
  return (
    <header className="hero dark" id="top">
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__glow" aria-hidden="true" />

      <Container width="wide">
        <h1 className="hero__title">
          <span className="hero__acronym">FADA</span>
          <span className="hero__subtitle" aria-label={SITE.title}>
            <i className="hero__hl">F</i>ew-Shot Domain{' '}
            <i className="hero__hl">A</i>daptation via{' '}
            <i className="hero__hl">D</i>ynamics{' '}
            <i className="hero__hl">A</i>lignment for Humanoid Control
          </span>
        </h1>

        <p className="hero__tagline">{SITE.tagline}</p>

        <a className="hero__timeline-link" href={assetUrl('timeline_v2.html')}>
          Read the research timeline <span aria-hidden="true">→</span>
        </a>

        <dl className="hero__stats">
          {HERO_STATS.map((s) => (
            <div key={s.label} className="hero__stat" style={{ ['--stat-color' as string]: TONE_VAR[s.tone ?? 'neutral'] }}>
              <dt className="hero__stat-value">{s.value}</dt>
              <dd className="hero__stat-label">{s.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </header>
  )
}
