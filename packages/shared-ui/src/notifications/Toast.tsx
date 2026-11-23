import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  alpha,
  Box,
  IconButton,
  keyframes,
  Typography,
  useTheme,
  type AlertColor,
} from '@mui/material';
import * as React from 'react';

export type ToastSeverity = AlertColor;

export interface ToastProps {
  id: number;
  message: string;
  title?: string;
  severity?: ToastSeverity;
  duration?: number;
  exiting?: boolean;
  onDismiss: (id: number) => void;
}

const slideIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(18px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const slideOut = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
    max-height: 120px;
    margin-bottom: 0px;
  }
  100% {
    opacity: 0;
    transform: translateY(18px) scale(0.96);
    max-height: 0px;
    margin-bottom: -10px;
    padding-top: 0;
    padding-bottom: 0;
  }
`;

const DURATION_BY_SEVERITY: Record<ToastSeverity, number> = {
  success: 4000,
  info: 4000,
  warning: 5500,
  error: 7500,
};

function renderSeverityIcon(severity: ToastSeverity) {
  switch (severity) {
    case 'success':
      return <CheckCircleRoundedIcon sx={{ fontSize: 22 }} color="success" />;
    case 'error':
      return <ErrorOutlineRoundedIcon sx={{ fontSize: 22 }} color="error" />;
    case 'warning':
      return <WarningAmberRoundedIcon sx={{ fontSize: 22 }} color="warning" />;
    case 'info':
    default:
      return <InfoOutlinedIcon sx={{ fontSize: 22 }} color="info" />;
  }
}

/** A modern toast notification styled entirely using the application theme palette. */
export function Toast({
  id,
  message,
  title,
  severity = 'info',
  duration,
  exiting = false,
  onDismiss,
}: ToastProps) {
  const theme = useTheme();
  const paletteColor = theme.palette[severity] ?? theme.palette.info;
  const autoHideMs = duration ?? DURATION_BY_SEVERITY[severity] ?? 4000;

  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = React.useRef<number>(Date.now());
  const remainingRef = React.useRef<number>(autoHideMs);

  const startTimer = React.useCallback(() => {
    if (remainingRef.current <= 0) return;
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(id);
    }, remainingRef.current);
  }, [id, onDismiss]);

  const pauseTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      remainingRef.current -= Date.now() - startTimeRef.current;
    }
  }, []);

  React.useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTimer]);

  const accentColor = paletteColor.main;
  const haloBackground = alpha(
    accentColor,
    theme.palette.mode === 'dark' ? 0.18 : 0.1,
  );
  const borderColor = alpha(
    accentColor,
    theme.palette.mode === 'dark' ? 0.35 : 0.25,
  );

  return (
    <Box
      role="alert"
      aria-live={severity === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      sx={{
        width: '100%',
        maxWidth: 440,
        borderRadius: '12px',
        bgcolor: alpha(theme.palette.background.paper, 0.96),
        backdropFilter: 'blur(16px)',
        border: '1px solid',
        borderColor,
        boxShadow: (t) =>
          `0 10px 28px -4px ${alpha(t.palette.common.black, t.palette.mode === 'dark' ? 0.5 : 0.12)}, 0 4px 12px -2px ${alpha(t.palette.common.black, t.palette.mode === 'dark' ? 0.3 : 0.05)}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: '10px 14px',
        pointerEvents: 'auto',
        overflow: 'hidden',
        position: 'relative',
        animation: `${exiting ? slideOut : slideIn} ${
          exiting ? '220ms' : '280ms'
        } cubic-bezier(0.16, 1, 0.3, 1) forwards`,
        transition: theme.transitions.create(['box-shadow', 'transform'], {
          duration: 200,
        }),
        '&:hover': {
          boxShadow: (t) =>
            `0 14px 36px -4px ${alpha(t.palette.common.black, t.palette.mode === 'dark' ? 0.6 : 0.18)}, 0 6px 16px -2px ${alpha(t.palette.common.black, t.palette.mode === 'dark' ? 0.35 : 0.08)}`,
        },
      }}
    >
      {/* Accent left indicator bar */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: accentColor,
          borderTopLeftRadius: '12px',
          borderBottomLeftRadius: '12px',
        }}
      />

      {/* Severity Icon with halo background */}
      <Box
        sx={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: '9px',
          bgcolor: haloBackground,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {renderSeverityIcon(severity)}
      </Box>

      {/* Text Content - vertically centered */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {title && (
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'text.primary',
              lineHeight: 1.25,
              mb: 0.25,
            }}
          >
            {title}
          </Typography>
        )}
        <Typography
          variant="body2"
          sx={{
            color: 'text.primary',
            fontSize: '0.84rem',
            lineHeight: 1.4,
            fontWeight: title ? 400 : 500,
            wordBreak: 'break-word',
          }}
        >
          {message}
        </Typography>
      </Box>

      {/* Dismiss Button - vertically centered */}
      <IconButton
        size="small"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(id)}
        sx={{
          flexShrink: 0,
          color: 'text.secondary',
          p: 0.5,
          borderRadius: '8px',
          opacity: 0.65,
          transition: 'all 150ms ease-in-out',
          '&:hover': {
            opacity: 1,
            bgcolor: 'action.hover',
            color: 'text.primary',
          },
        }}
      >
        <CloseRoundedIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
}
