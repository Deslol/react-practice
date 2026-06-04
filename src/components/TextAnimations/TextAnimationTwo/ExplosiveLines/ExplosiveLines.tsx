// ExplosiveLines.tsx
import type { CSSProperties } from 'react';
import style from './ExplosiveLines.module.scss';

type LineConfig = {
  angle: string;
  left?: string;
  lineHeight: string;
};

type ExplosiveLinesProps = {
  lines?: readonly LineConfig[];
  className?: string;
};

const DEFAULT_LINES = [
    {angle: '35deg', left: '-50px', lineHeight: '40px'},
    {angle: '25deg', left: '-20px', lineHeight: '80px'},
    {angle: '0deg', left: undefined, lineHeight: '80px'},
    {angle: '-35deg', left: '20px', lineHeight: '80px'},
    {angle: '-45deg', left: '50px', lineHeight: '40px'},
] as const;


export function ExplosiveLines({
  lines = DEFAULT_LINES,
  className,
}: ExplosiveLinesProps) {
  return (
    <div className={`${style.explosiveLines} ${className ?? ''}`}>
      {lines.map(({ angle, left, lineHeight }, i) => (
        <div
          key={`${angle}-${left ?? '0'}-${i}`}
          className={style.lineWrapper}
          style={{ '--angle': angle } as CSSProperties}
        >
          <span
            className={style.line}
            style={{
              left,
              '--line-height': lineHeight,
            } as CSSProperties}
          />
        </div>
      ))}
    </div>
  );
}