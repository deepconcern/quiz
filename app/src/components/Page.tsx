import { SxProps } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { FC, PropsWithChildren } from "react";
import { Link } from "react-router-dom";

export type PagePropx = PropsWithChildren<{
  sx?: SxProps,
}>;

export const Page: FC<PagePropx> = ({ children, sx }) => {
  return (
    <>
      <AppBar>
        <Toolbar>
        <Typography
            variant="h6"
            noWrap
            component={Link}
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
            to="/"
          >
            Quiz App
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar/>
      <Box component="main" sx={sx}>
        {children}
      </Box>
    </>
  );
};
