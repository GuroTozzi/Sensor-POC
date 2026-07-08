import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Crosshair, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "./Button";
import styles from "./ThreeDViewportControls.module.css";

interface ThreeDViewportControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPan: (dx: number, dy: number) => void;
  onReset: () => void;
}

export function ThreeDViewportControls({ onZoomIn, onZoomOut, onPan, onReset }: ThreeDViewportControlsProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <Button variant="secondary" size="sm" fullWidth icon={<ZoomIn size={14} />} onClick={onZoomIn}>
          Zoom in
        </Button>
        <Button variant="secondary" size="sm" fullWidth icon={<ZoomOut size={14} />} onClick={onZoomOut}>
          Zoom out
        </Button>
      </div>

      <div className={styles.padGrid}>
        <span />
        <button type="button" className={styles.padButton} onClick={() => onPan(0, 1)} aria-label="Sposta su">
          <ArrowUp size={16} />
        </button>
        <span />
        <button type="button" className={styles.padButton} onClick={() => onPan(-1, 0)} aria-label="Sposta sinistra">
          <ArrowLeft size={16} />
        </button>
        <span className={styles.padCenter}>
          <Crosshair size={14} />
        </span>
        <button type="button" className={styles.padButton} onClick={() => onPan(1, 0)} aria-label="Sposta destra">
          <ArrowRight size={16} />
        </button>
        <span />
        <button type="button" className={styles.padButton} onClick={() => onPan(0, -1)} aria-label="Sposta giù">
          <ArrowDown size={16} />
        </button>
        <span />
      </div>

      <Button variant="ghost" size="sm" fullWidth onClick={onReset}>
        Reset vista
      </Button>
    </div>
  );
}
