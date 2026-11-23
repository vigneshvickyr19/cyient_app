import type { SxProps, Theme } from '@mui/material/styles';

/** One entry of an `sx` array (what MUI accepts when `sx` is given as a list). */
export type SxItem = Extract<SxProps<Theme>, readonly unknown[]>[number];

/** An `sx` prop as a list, so a component can merge its own styles with the caller's: `sx={[own, ...sxList(sx)]}`. */
export function sxList(sx: SxProps<Theme> | undefined): readonly SxItem[] {
  if (Array.isArray(sx)) return sx as readonly SxItem[];
  return sx ? [sx as SxItem] : [];
}
