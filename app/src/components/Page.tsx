import { SxProps } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import {
  FC,
  FormEvent,
  MouseEvent,
  PropsWithChildren,
  useCallback,
  useState,
} from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

type LoginDialogProps = {
  defaultMode?: "login" | "signup" | null;
  onClose?: () => void;
  open?: boolean | null;
};

const LoginDialog: FC<LoginDialogProps> = ({ onClose, open }) => {
  const [mode, setMode] = useState("login");

  const { refetch } = useUser();

  const handleSubmit = useCallback(async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const fd = new FormData(ev.target as HTMLFormElement);

    const username = fd.get("username");
    const password = fd.get("password");

    const authString = `${username}:${password}`;

    const token = btoa(Array.from(new TextEncoder().encode(authString), byte => String.fromCodePoint(byte)).join(""));

    const response = await fetch(`/api/${mode}`, {
      headers: {
        "Authorization": `Basic ${token}`,
      },
      method: "POST",
    });

    if (!response.ok) {
      const text = await response.text();

      console.error("Failed to login:", response.status, response.statusText);
      console.error(text);

      return;
    }

    refetch();
    onClose?.();
  }, [mode, onClose, refetch]);

  const handleTabClick = useCallback(
    (_: unknown, newValue: "login" | "signup") => {
      setMode(newValue);
    },
    [setMode]
  );

  return (
    <Dialog
      onClose={onClose}
      open={!!open}
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>{mode === "login" ? "Login" : "Signup"}</DialogTitle>
      <DialogContent>
        <Tabs onChange={handleTabClick} value={mode}>
          <Tab label="Login" value="login" />
          <Tab label="Signup" value="signup"></Tab>
        </Tabs>
        <TextField
          fullWidth
          label="Username"
          name="username"
          required
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          required
          type="password"
        />
        {mode === "singup" && (
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirm-password"
            required
            type="password"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="contained">
          {mode === "login" ? "Login" : "Submit"}
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export type PagePropx = PropsWithChildren<{
  sx?: SxProps;
}>;

export const Page: FC<PagePropx> = ({ children, sx }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const navigate = useNavigate();
  const { refetch, user } = useUser();

  const handleLoginClick = useCallback(
    (ev: MouseEvent<HTMLAnchorElement>) => {
      ev.preventDefault();

      setDialogOpen(true);
    },
    [setDialogOpen]
  );

  const handleLogoutClick = useCallback(async (ev: MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault();

    const response = await fetch("/api/logout", {
      method: "POST",
    });

    if (!response.ok) {
      const text = await response.text();

      console.error("Failed to logout:", response.status, response.statusText);
      console.error(text);

      return;
    }

    refetch();
    navigate("/");
  }, [navigate, refetch]);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
  }, [setDialogOpen]);

  return (
    <>
      <AppBar>
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              color: "inherit",
              textDecoration: "none",
            }}
            to="/"
          >
            Quiz App
          </Typography>
          {user ? (
            <>
              <Link color="inherit">
                {user.username}
              </Link>
              <Typography sx={{ mx: 2 }}>|</Typography>
              <Link color="inherit" href="#" onClick={handleLogoutClick}>
                Logout
              </Link>
            </>
          ) : (
            <Link color="inherit" href="#" onClick={handleLoginClick}>
              Login
            </Link>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Box component="main" sx={sx}>
        {children}
      </Box>
      <LoginDialog onClose={handleDialogClose} open={isDialogOpen} />
    </>
  );
};
