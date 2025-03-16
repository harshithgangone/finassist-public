"use client"

import { useState, useEffect } from "react"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Avatar,
} from "@mui/material"
import { Menu as MenuIcon } from "@mui/icons-material"
import { motion } from "framer-motion"

const navItems = [
  { name: "Home", href: "#" },
  { name: "Loans", href: "#loans" },
  { name: "Calculator", href: "#calculator" },
  { name: "Features", href: "#features" },
  { name: "Testimonials", href: "#testimonials" },
]

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [scrolled])

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
        <Avatar sx={{ bgcolor: "primary.main", mr: 1 }}>F</Avatar>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          FinAssist
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem button key={item.name} component="a" href={item.href}>
            <ListItemText primary={item.name} sx={{ textAlign: "center" }} />
          </ListItem>
        ))}
        <ListItem sx={{ justifyContent: "center", mt: 2 }}>
          <Button variant="contained" color="primary">
            Login
          </Button>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={scrolled ? 4 : 0}
      sx={{
        bgcolor: scrolled ? "rgba(255, 255, 255, 0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        transition: "all 0.3s ease",
        zIndex: 1100, // Set a specific z-index that's lower than the chat widget
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar sx={{ bgcolor: "primary.main", mr: 1 }}>F</Avatar>
              <Typography
                variant="h6"
                noWrap
                component="a"
                href="/"
                sx={{
                  mr: 2,
                  fontWeight: 700,
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                FinAssist
              </Typography>
            </Box>
          </motion.div>

          {isMobile ? (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton color="inherit" aria-label="open drawer" edge="end" onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                  keepMounted: true,
                }}
              >
                {drawer}
              </Drawer>
            </>
          ) : (
            <>
              <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Button color="inherit" sx={{ mx: 1 }} href={item.href}>
                      {item.name}
                    </Button>
                  </motion.div>
                ))}
              </Box>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <Button variant="contained" color="primary">
                  Login
                </Button>
              </motion.div>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Navbar

