import { Button as MuiButton, type ButtonProps as MuiButtonProps } from '@mui/material';
import { Link as RouterLink } from 'react-router';

export type ButtonProps = MuiButtonProps & {
  /** Shows a spinner and blocks further clicks while an action runs. */
  loading?: boolean;
};

/** The app's button: MUI's, with a loading state that also disables it. */
export function Button({ loading = false, disabled, loadingPosition, startIcon, ...props }: ButtonProps) {
  return (
    <MuiButton
      {...props}
      startIcon={startIcon}
      loading={loading}
      loadingPosition={loadingPosition ?? (startIcon ? 'start' : 'center')}
      disabled={disabled ?? loading}
    />
  );
}

/** A button's props with the router link's (`to`: an address in the app, for example /requests/new). */
export type LinkButtonProps = Omit<MuiButtonProps<typeof RouterLink>, 'component'>;

/** A button that goes to another page of the app (a link, so it can be opened in a new tab). */
export function LinkButton(props: LinkButtonProps) {
  return <MuiButton component={RouterLink} {...props} />;
}
