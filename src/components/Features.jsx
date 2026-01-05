import { Container, Grid, Alert, CardActionArea, Snackbar, Typography, Box, Button, useTheme, useMediaQuery, } from "@mui/material";
import React, { useState, useEffect } from "react";
import { styled } from "@mui/system";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import "./css/Features.css"; // Importamos el CSS
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import DialogTrabajos from "./DialogTrabajos";
import { cargarTrabajos } from "../helpers/HelperTrabajos";
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import PrecisionManufacturingRoundedIcon from '@mui/icons-material/PrecisionManufacturingRounded';

dayjs.extend(duration);

// DATOS
const features = [
  {
    label: "Niños",
    imageSrc: "/ninos.jpg",
  },
  {
    label: "Adulto",
    imageSrc: "/adulto.webp",
  },
  {
    label: "Mayoristas",
    imageSrc: "/mayoristas.jpg",
  },
  {
    label: "Regalos",
    imageSrc: "/regalos.webp",
  },
  {
    label: "Hogar",
    imageSrc: "/hogar.webp",
  },
];

const disabledLabels = ["Regalos"]; // ejemplo



// EFECTOS
function Features({ videoReady, informationsRef }) {

  const theme = useTheme();
  const timestamp = Date.now();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.1 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");
  const deadline = dayjs("2025-09-20T15:00:00").toDate();

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trabajos, setTrabajos] = useState([]);
  const [openTrabajos, setOpenTrabajos] = useState(false);
  const scrollToRef = (ref, offset = -80) => ref?.current && window.scrollTo({ top: ref.current.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' });

  // handlers
  const handleTrabajosClick = () => setOpenTrabajos(true);
  const handleCloseTrabajos = () => setOpenTrabajos(false);

  //TRABAJOS S3
  useEffect(() => {
    cargarTrabajos(`https://rosmiya.s3.us-east-2.amazonaws.com/Trabajos.xlsx?t=${timestamp}`)
      .then(setTrabajos);
  }, []);


  //EVITAR ANIMACIÓN DUPLICADA
  useEffect(() => {
    let timer;
    if (inView && !hasAnimated) {
      if (videoReady) {
        timer = setTimeout(() => {
          setHasAnimated(true);
        }, 0);
      }
    }
    return () => clearTimeout(timer);
  }, [videoReady, inView, hasAnimated]);

  //APARICIÓN
  const cardAnimation = {
    hidden: { opacity: 0, x: 150 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, delay: 1 + index * 0.3, ease: "easeOut" },
    }),
  };
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft("Finalizado");
        clearInterval(timer);
      } else {
        const d = dayjs.duration(diff);
        const days = Math.floor(d.asDays());
        const hours = d.hours();
        const minutes = d.minutes();

        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // TRABAJOS ACTIVOS
  const trabajosActivos = trabajos.filter(t => Number(t.Estado) === 1);

  // Ahora cuentas sobre los activos
  const mayoristas = trabajosActivos.filter(t => Number(t.TipoTrabajo) === 2).length;
  const confeccionesrosmiya = trabajosActivos.filter(t => Number(t.TipoTrabajo) === 1).length;

  return (
    <Box
      sx={{
        background: `
      linear-gradient(
        180deg,
        #ffffff 0%,
        #f5fcfb 40%,
        #eaf7f5 70%,
        #d5ede9 100%
      )
    `,
        py: 2,
        paddingBottom: "15px",
        color: "#ffffff",
        overflowY: "visible",
      }}
    >

      <Container sx={{ py: 0, maxWidth: "1500px !important", overflow: 'hidden' }}>
        <Box ref={ref} sx={{ mt: 0 }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
            }
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: isMobile ? 0.8 : 0.3,
            }}
            style={{
              minHeight: "60px",
              display: "flex",
              justifyContent: "center",
              marginTop: "10px",
              marginBottom: "16px",
            }}
          >
            <Button
              onClick={handleTrabajosClick}
              variant="contained"
              fullWidth
              sx={{
                minWidth: { xs: "320px", sm: "360px" },
                height: "58px",
                borderRadius: "14px",
                textTransform: "none",
                fontFamily: "Albert Sans, sans-serif",
                fontWeight: 600,
                color: "#fff",
                background:
                  "linear-gradient(135deg, #2ecc71, #27ae60 45%, #1e8449 85%)", // 💎 Esmeralda
                backgroundSize: "200% 200%",
                animation:
                  "gradientShift 8s ease infinite, pulseGlow 6s ease-in-out infinite", // 💡 Pulso general
                boxShadow: "0 6px 16px rgba(46, 204, 113, 0.4)",
                position: "relative",
                overflow: "hidden",
                justifyContent: "center",
                gap: 0,
                maxWidth: { xs: "100%", md: "520px" },
                border: "2px solid rgba(129, 245, 180, 0.9)",
                zIndex: 1,
                transition: "all 0.3s ease",

                "&:hover": {
                  background: "linear-gradient(135deg,#58d68d,#28b463)",
                  boxShadow:
                    "0 0 8px rgba(46,204,113,.8), inset 0 0 8px rgba(255,255,255,0.3)",
                },

                /* ✨ Efecto hover: reloj más brillante y rápido */
                "&:hover .MuiSvgIcon-root": {
                  filter: "drop-shadow(0 0 14px rgba(129,245,180,1))",
                  animation: "clock 4s linear infinite !important",
                },

                /* 💥 Destello radial al hacer click */
                "&:active::before": {
                  background:
                    "radial-gradient(circle at center, rgba(129,245,180,0.5) 0%, transparent 70%)",
                  animation: "none",
                },

                /* ✨ BRILLO EXTERNO — Border Sweep + Pulse */
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: "-2px",
                  borderRadius: "inherit",
                  background:
                    "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.9) 10%, #b9f6ca 20%, rgba(255,255,255,0.9) 30%, transparent 40%)",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "300% 300%",
                  animation:
                    "shineBorderSweep 3s linear infinite, pulseGlow 4s ease-in-out infinite",
                  pointerEvents: "none",
                  zIndex: 2,
                  mask:
                    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  maskComposite: "exclude",
                  WebkitMask:
                    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  WebkitMaskComposite: "xor",
                },

                /* ✨ BRILLO INTERNO — Sheen diagonal */
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(130deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%)",
                  transform: "translateX(-100%)",
                  animation: "shineDiagonal 4s ease-in-out infinite",
                  borderRadius: "inherit",
                  pointerEvents: "none",
                  zIndex: 1,
                },

                "&:hover::after": {
                  animation: "shineDiagonal 1.2s ease-in-out",
                },

                "@keyframes shineBorderSweep": {
                  "0%": { backgroundPosition: "-300% 0" },
                  "100%": { backgroundPosition: "300% 0" },
                },

                "@keyframes pulseGlow": {
                  "0%, 100%": {
                    filter: "drop-shadow(0 0 6px rgba(129,245,180,.35))",
                  },
                  "50%": { filter: "drop-shadow(0 0 14px rgba(129,245,180,.85))" },
                },

                "@keyframes shineDiagonal": {
                  "0%": { transform: "translateX(-120%) rotate(0deg)" },
                  "100%": { transform: "translateX(120%) rotate(0deg)" },
                },

                "@keyframes gradientShift": {
                  "0%": { backgroundPosition: "0% 50%" },
                  "50%": { backgroundPosition: "100% 50%" },
                  "100%": { backgroundPosition: "0% 50%" },
                },
              }}
            >
              {/* 🌟 Contenido principal */}
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  overflow: "visible",
                  zIndex: 3,
                }}
              >
                {/* 🕓 Reloj con posición y animación */}
                <motion.div
                  key="reloj"
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={
                    hasAnimated
                      ? { opacity: 1, scale: 1.2 }
                      : { opacity: 0, scale: 0.7 }
                  }
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    left: "48%",
                    top: "15%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <motion.div
                    initial={{ x: 0, y: 0, scale: 1.5 }}
                    animate={
                      hasAnimated
                        ? {
                          x: [0, 0, isMobile ? "-116px" : "-130px"],
                          y: [0, 0, "-2px"],
                          scale: [1.4, 1.3, 0.7],
                        }
                        : { x: 0, y: 0, scale: 1.5 }
                    }
                    transition={{
                      duration: 3,
                      ease: "easeInOut",
                      times: [0, 0.66, 1],
                    }}
                  >
                    <PrecisionManufacturingRoundedIcon
                      sx={{
                        fontSize: { xs: 28, sm: 30 },
                        color: "#fff",
                        filter: "drop-shadow(0 0 8px rgba(46,204,113,.9))",
                        animation: "phonePulse 3s ease-in-out infinite",
                        transformOrigin: "center",
                        "@keyframes phonePulse": {
                          "0%, 100%": {
                            transform: "scale(1)",
                            filter: "drop-shadow(0 0 8px rgba(46,204,113,.9))",
                          },
                          "50%": {
                            transform: "scale(1.15)",
                            filter: "drop-shadow(0 0 16px rgba(129,245,180,1))",
                          },
                        },
                      }}
                    />

                  </motion.div>
                </motion.div>

                {/* 📋 Texto + chip + clic */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={hasAnimated ? { opacity: 1 } : { opacity: 0 }}
                  transition={{
                    delay: 2.8,
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginLeft: "35px",
                    zIndex: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.65rem", sm: "0.85rem" },
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    EN PRODUCCIÓN:
                  </Typography>

                  {/* 🧱 Chip verde */}
                  <Box
                    sx={{
                      minWidth: { xs: 90, sm: 120 },
                      textAlign: "center",
                      px: { xs: 0.6, sm: 1.2 },
                      py: 0.4,
                      borderRadius: "8px",
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #2ecc71, #27ae60, #1e8449)",
                      border: "2px solid rgba(255,255,255,.8)",
                      boxShadow:
                        "0 0 6px rgba(46,204,113,0.5), inset 0 0 6px rgba(255,255,255,0.25)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Mayoristas
                  </Box>

                  {/* 🖱️ Clic animado */}
                  <Box
                    component={motion.img}
                    src="/clic.jpg"
                    alt="clic"
                    loading="lazy"
                    initial={{ scale: 1, y: 0 }}
                    animate={{ scale: [1, 0.9, 1], y: [0, 1, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    whileTap={{ scale: 0.85, rotate: -3 }}
                    whileHover={{ scale: 1.03, y: -1 }}
                    sx={{
                      filter: "invert(1) brightness(2)",
                      width: { xs: 23, sm: 25 },
                      height: "auto",
                      display: "block",
                      userSelect: "none",
                    }}
                  />
                </motion.div>
              </Box>
            </Button>

          </motion.div>


          <Grid container spacing={2} justifyContent="center" mt={0.8}>
            {features.map((feature, index) => {
              const isDisabled = disabledLabels.includes(feature.label);
              if (isMobile && index >= 4) return null;

              return (
                <Grid item xs={6} sm={4} md={2.2} key={index}>
                  <motion.div
                    initial="hidden"
                    animate={hasAnimated ? "visible" : "hidden"}
                    variants={cardAnimation}
                    custom={index}
                  >
                    <Box
                      onClick={() => {
                        if (!isDisabled) navigate("/catalogo");
                      }}
                      sx={{
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        opacity: isDisabled ? 0.45 : 1,
                        pointerEvents: isDisabled ? "none" : "auto",
                        transition: "transform .3s ease",
                        "&:hover": {
                          transform: isDisabled ? "none" : "translateY(-4px)",
                        },
                      }}
                    >
                      {/* Imagen */}
                      <Box
                        sx={{
                          width: "100%",
                          height: 160,
                          borderRadius: 3,
                          overflow: "hidden",
                          position: "relative",
                          boxShadow: "0 10px 28px rgba(0,0,0,0.18)",
                          filter: isDisabled ? "grayscale(100%) brightness(0.85)" : "none",
                        }}
                      >
                        <img
                          src={feature.imageSrc}
                          alt={feature.label}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />

                        {/* Overlay */}
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(to top, rgba(0,0,0,.65), rgba(0,0,0,.15))",
                          }}
                        />

                        {/* Próximamente */}
                        {isDisabled && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              px: 1.2,
                              py: 0.4,
                              borderRadius: "999px",
                              backgroundColor: "rgba(255,255,255,.85)",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              color: "#444",
                            }}
                          >
                            Próximamente
                          </Box>
                        )}
                      </Box>

                      {/* Texto */}
                      <Box sx={{ mt: 1.2, textAlign: "center" }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#0f172a",
                            fontFamily: '"Poppins", sans-serif',
                          }}
                        >
                          {feature.label}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "0.85rem",
                            color: "#475569",
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>



        </Box>
      </Container >

      <DialogTrabajos
        open={openTrabajos}
        onClose={handleCloseTrabajos}
        trabajos={trabajosActivos}
        primaryLabel="Ver Servicios"
        onPrimaryClick={() => { handleCloseTrabajos(); scrollToRef(informationsRef); }}
      />
    </Box >
  );
}

export default Features;
