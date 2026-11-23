import SearchIcon from '@mui/icons-material/Search';
import { Box, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import { useSidebar } from './SidebarContext';

export function SidebarSearch() {
  const { collapsed, setCollapsed, searchQuery, setSearchQuery } = useSidebar();

  if (collapsed) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', px: 1.5, mb: 2 }}>
        <Tooltip title="Search (⌘S)" placement="right">
          <IconButton
            size="small"
            onClick={() => setCollapsed(false)}
            aria-label="Search"
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'text.primary',
              },
            }}
          >
            <SearchIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, mb: 2 }}>
      <TextField
        fullWidth
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <Box
                    component="kbd"
                    sx={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '4px',
                      px: 0.6,
                      py: 0.2,
                    }}
                  >
                    ⌘
                  </Box>
                  <Box
                    component="kbd"
                    sx={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '4px',
                      px: 0.6,
                      py: 0.2,
                    }}
                  >
                    S
                  </Box>
                </Box>
              </InputAdornment>
            ),
            sx: {
              height: 38,
              borderRadius: '10px',
              bgcolor: 'background.paper',
              fontSize: '0.875rem',
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'text.secondary',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          },
        }}
      />
    </Box>
  );
}
