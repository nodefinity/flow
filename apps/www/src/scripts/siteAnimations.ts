import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

setupHeader()
bindWaitlistFeedback()

if (!prefersReducedMotion) {
  animateHero()
  animateRadioSignals()
  animateParallax()
  animateReveals()
  bindTiltPanels()
}

function setupHeader() {
  const header = document.querySelector('[data-site-header]')

  if (!header)
    return

  if (!prefersReducedMotion) {
    gsap.from(header, {
      y: -18,
      autoAlpha: 0,
      duration: 0.6,
      ease: 'power3.out',
    })
  }

  ScrollTrigger.create({
    start: 24,
    end: 'max',
    onUpdate: self => header.classList.toggle('is-scrolled', self.scroll() > 24),
  })
}

function animateHero() {
  const heroItems = gsap.utils.toArray<HTMLElement>('[data-hero-item]')
  const playerCard = document.querySelector<HTMLElement>('.player-card')
  const floatingBadges = gsap.utils.toArray<HTMLElement>('.floating-badge')

  if (heroItems.length) {
    gsap.from(heroItems, {
      y: 30,
      autoAlpha: 0,
      duration: 0.76,
      ease: 'power3.out',
      stagger: 0.08,
      delay: 0.12,
    })
  }

  if (playerCard) {
    gsap.fromTo(
      playerCard,
      { y: 22, rotate: -1.5, scale: 0.98, autoAlpha: 0 },
      { y: 0, rotate: 0, autoAlpha: 1, duration: 0.88, ease: 'power3.out', delay: 0.28 },
    )
  }

  if (floatingBadges.length) {
    gsap.from(floatingBadges, {
      y: 18,
      scale: 0.96,
      autoAlpha: 0,
      duration: 0.56,
      ease: 'power3.out',
      stagger: 0.12,
      delay: 0.5,
    })
  }
}

function animateRadioSignals() {
  const waveBars = gsap.utils.toArray<HTMLElement>('[data-wave-bar]')

  if (waveBars.length) {
    gsap.to(waveBars, {
      scaleY: () => gsap.utils.random(0.35, 1.22),
      opacity: () => gsap.utils.random(0.62, 1),
      duration: 0.54,
      ease: 'sine.inOut',
      repeat: -1,
      repeatRefresh: true,
      yoyo: true,
      stagger: {
        each: 0.018,
        from: 'random',
      },
    })
  }
}

function animateParallax() {
  const parallaxItems = gsap.utils.toArray<HTMLElement>('[data-parallax]')

  for (const item of parallaxItems) {
    const speed = Number(item.dataset.parallaxSpeed ?? 0)

    if (!Number.isFinite(speed) || speed === 0)
      continue

    gsap.to(item, {
      y: speed,
      ease: 'none',
      scrollTrigger: {
        trigger: item.closest('section') ?? item,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8,
      },
    })
  }

  const channelCards = gsap.utils.toArray<HTMLElement>('[data-parallax-card]')

  for (const card of channelCards) {
    gsap.fromTo(
      card,
      { y: 18 },
      {
        y: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      },
    )
  }
}

function animateReveals() {
  const revealGroups = gsap.utils.toArray<HTMLElement>('[data-reveal-group]')

  for (const group of revealGroups) {
    const items = gsap.utils.toArray<HTMLElement>('[data-reveal]', group)

    if (!items.length)
      continue

    gsap.from(items, {
      y: 32,
      autoAlpha: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: {
        trigger: group,
        start: 'top 78%',
        once: true,
      },
    })
  }
}

function bindTiltPanels() {
  const panels = gsap.utils.toArray<HTMLElement>('[data-tilt-panel], [data-parallax-card]')

  for (const panel of panels) {
    panel.addEventListener('pointermove', (event) => {
      const rect = panel.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5

      gsap.to(panel, {
        rotateX: y * -2.5,
        rotateY: x * 3,
        scale: 1.01,
        transformPerspective: 900,
        duration: 0.34,
        ease: 'power3.out',
      })
    })

    panel.addEventListener('pointerleave', () => {
      gsap.to(panel, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.46,
        ease: 'elastic.out(1, 0.72)',
      })
    })
  }
}

function bindWaitlistFeedback() {
  document.addEventListener('flow:waitlist-status', (event) => {
    if (!(event.target instanceof HTMLElement))
      return

    const form = event.target.closest('[data-waitlist-form]')
    const status = form?.querySelector('[data-waitlist-status]')

    if (!(form instanceof HTMLElement) || !(status instanceof HTMLElement))
      return

    if (prefersReducedMotion)
      return

    gsap.fromTo(
      status,
      { y: 6, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.24, ease: 'power2.out' },
    )

    if (event instanceof CustomEvent && event.detail?.state === 'success') {
      gsap.fromTo(
        form,
        { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' },
        {
          boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.18)',
          duration: 0.24,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        },
      )
    }
  })
}
