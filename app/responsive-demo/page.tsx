// b:\zenithopensourceprojects\projectbillforge\app\responsive-demo\page.tsx
import styles from './page.module.css';

export const metadata = {
    title: 'Responsive Fluid Grid Demo | Mobile-First UI',
    description: 'A beautiful, mobile-first, flawlessly responsive fluid grid showcasing CSS grid auto-fit, clamp() padding, and touch accessibility.',
};

export default function ResponsiveDemo() {
    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Flawless Fluid Grid</h1>
                <p className={styles.subtitle}>
                    A mobile-first architectural pattern showcasing dynamic typography,
                    fluid clamp() spacing, touch-accessible interactions, and auto-adapting CSS grid layouts.
                </p>
            </header>

            <div className={styles.grid}>
                {/* Tile 1: Dynamic Spacing */}
                <article className={styles.tile}>
                    <div className={styles.tileContent}>
                        <div className={styles.tileIcon}>
                            {/* Box icon */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                <line x1="12" y1="22.08" x2="12" y2="12" />
                            </svg>
                        </div>
                        <h2 className={styles.tileTitle}>Dynamic Spacing</h2>
                        <p className={styles.tileText}>
                            Padding seamlessly scales with the viewport using CSS <code>clamp()</code>.
                            No more rigid pixel values blowing out horizontal space on restrictive mobile screens.
                        </p>
                    </div>
                    <button className={styles.actionButton}>Explore Spacing</button>
                </article>

                {/* Tile 2: Grid Auto-Fit */}
                <article className={styles.tile}>
                    <div className={styles.tileContent}>
                        <div className={styles.tileIcon}>
                            {/* Grid Layout icon */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                        </div>
                        <h2 className={styles.tileTitle}>Auto-Wrap Grids</h2>
                        <p className={styles.tileText}>
                            Utilizing <code>grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr))</code>
                            automatically flows cards optimally—preventing overflow while deleting the need for
                            dozens of arbitrary breakpoints.
                        </p>
                    </div>
                    <button className={styles.actionButton}>View Grid Logic</button>
                </article>

                {/* Tile 3: Touch Accessible */}
                <article className={styles.tile}>
                    <div className={styles.tileContent}>
                        <div className={styles.tileIcon}>
                            {/* Touch Interaction icon */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </div>
                        <h2 className={styles.tileTitle}>Touch Accessible</h2>
                        <p className={styles.tileText}>
                            Mobile users rejoice. Every interactive element explicitly enforces a
                            <code>min-height</code> and <code>min-width</code> of 48px,
                            meeting the highest accessibility specs for fat-finger tapping.
                        </p>
                    </div>
                    <button className={styles.actionButton}>Test Accessibility</button>
                </article>

                {/* Tile 4: Premium Aesthetics */}
                <article className={styles.tile}>
                    <div className={styles.tileContent}>
                        <div className={styles.tileIcon}>
                            {/* Magic Wand icon */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
                                <path d="m14 7 3 3" />
                                <path d="M5 6v4" />
                                <path d="M19 14v4" />
                                <path d="M10 2v2" />
                                <path d="M7 8H3" />
                                <path d="M21 16h-4" />
                                <path d="M11 3H9" />
                            </svg>
                        </div>
                        <h2 className={styles.tileTitle}>Glassmorphism</h2>
                        <p className={styles.tileText}>
                            Built with dynamic, interactive hover-states, micro-animations,
                            and dark-mode respecting translucent surfaces that provide a modern app-feel.
                        </p>
                    </div>
                    <button className={styles.actionButton}>Activate Magic</button>
                </article>
            </div>
        </main>
    );
}
