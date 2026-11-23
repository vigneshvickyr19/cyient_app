import {
  Box,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
  keyframes,
} from '@mui/material';

const pulse = keyframes`
  0% {
    transform: scale(0.97);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.03);
    opacity: 1;
  }
  100% {
    transform: scale(0.97);
    opacity: 0.9;
  }
`;

const ripple = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(0, 163, 173, 0.4);
  }
  70% {
    box-shadow: 0 0 0 16px rgba(0, 163, 173, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 163, 173, 0);
  }
`;

function LoaderBrandEmblem() {
  return (
    <Box
      sx={{
        width: 52,
        height: 52,
        borderRadius: '14px',
        bgcolor: '#00a3ad',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(0, 163, 173, 0.35)',
        animation: `${ripple} 2.4s infinite ease-out, ${pulse} 3s infinite ease-in-out`,
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
    </Box>
  );
}

export interface PageLoaderProps {
  label?: string;
  subtitle?: string;
  fullPage?: boolean;
  appName?: string;
  brandName?: string;
}

/** A modern, polished page loader with brand accents and smooth indicators. */
export function PageLoader({
  label = 'Loading…',
  subtitle,
  fullPage = false,
  brandName,
  appName,
}: PageLoaderProps) {
  if (fullPage) {
    return (
      <Box
        role="status"
        aria-live="polite"
        sx={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          backgroundImage: (theme) =>
            theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at 50% 40%, rgba(0, 163, 173, 0.12) 0%, transparent 60%)'
              : 'radial-gradient(circle at 50% 35%, rgba(0, 163, 173, 0.08) 0%, rgba(244, 247, 251, 0.6) 50%, transparent 80%)',
          px: 2,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: 380,
            width: '100%',
            p: 4,
            borderRadius: '20px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(30, 41, 59, 0.75)'
                : 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 163, 173, 0.14)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 20px 40px rgba(0, 0, 0, 0.5)'
                : '0 20px 50px rgba(0, 163, 173, 0.12), 0 4px 12px rgba(0, 0, 0, 0.03)',
          }}
        >
          <Box sx={{ mb: 2.5 }}>
            <LoaderBrandEmblem />
          </Box>

          {(brandName || appName) && (
            <Stack spacing={0.5} sx={{ mb: 3 }}>
              {brandName && (
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: '-0.3px',
                    color: 'text.primary',
                    lineHeight: 1.2,
                  }}
                >
                  {brandName}
                </Typography>
              )}
              {appName && (
                <Typography
                  variant="caption"
                  sx={{
                    color: '#00a3ad',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}
                >
                  {appName}
                </Typography>
              )}
            </Stack>
          )}

          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2.5 }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={36}
              thickness={4}
              sx={{
                color: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 163, 173, 0.15)',
              }}
            />
            <CircularProgress
              variant="indeterminate"
              disableShrink
              size={36}
              thickness={4}
              sx={{
                color: '#00a3ad',
                animationDuration: '1000ms',
                position: 'absolute',
                left: 0,
                [`& .MuiCircularProgress-circle`]: {
                  strokeLinecap: 'round',
                },
              }}
            />
          </Box>

          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              letterSpacing: '-0.2px',
              mb: subtitle ? 0.75 : 0,
            }}
          >
            {label}
          </Typography>

          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.85rem',
                lineHeight: 1.45,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  // In-page loader (for Suspense fallbacks inside page content, tabs, etc.)
  return (
    <Stack
      role="status"
      aria-live="polite"
      spacing={2}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        flex: 1,
        width: '100%',
        minHeight: 'calc(100vh - 200px)',
        m: 'auto',
        py: 4,
        color: 'text.secondary',
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={36}
          thickness={3.5}
          sx={{
            color: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 163, 173, 0.12)',
          }}
        />
        <CircularProgress
          variant="indeterminate"
          disableShrink
          size={36}
          thickness={3.5}
          sx={{
            color: '#00a3ad',
            animationDuration: '1000ms',
            position: 'absolute',
            left: 0,
            [`& .MuiCircularProgress-circle`]: {
              strokeLinecap: 'round',
            },
          }}
        />
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
        {label}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 360 }}>
          {subtitle}
        </Typography>
      )}
    </Stack>
  );
}

/** Placeholder lines while a section loads, keeping the layout steady. */
export function SectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Box role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} variant="text" height={28} width={i === rows - 1 ? '60%' : '100%'} />
      ))}
    </Box>
  );
}
