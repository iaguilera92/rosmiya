import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Button, Card, CardContent, Snackbar, Alert, Dialog, AppBar, Toolbar, Paper,
  Box, Grid, TextField, IconButton, Collapse, FormControlLabel, Checkbox, useMediaQuery, useTheme
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import UpdateIcon from '@mui/icons-material/Update';
import RestoreIcon from '@mui/icons-material/Restore';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { cargarProductos } from '../../helpers/HelperProductos';
import { DialogEliminarProducto, DialogRestaurarProductos } from './DialogosProductos';
import MenuInferior from '../configuraciones/MenuInferior';

const ConfigurarProductos = () => {
  const [productos, setProductos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [restaurarOpen, setRestaurarOpen] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [restaurando, setRestaurando] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [dialogEditarOpen, setDialogEditarOpen] = useState(false);
  const [dialogVideoOpen, setDialogVideoOpen] = useState(false);
  const [previewImagen, setPreviewImagen] = useState(null);
  const functionsBaseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8888' : '';
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [imagenActualizada, setImagenActualizada] = useState(false);
  const [productoGuardado, setProductoGuardado] = useState(false);
  const [modoFormulario, setModoFormulario] = useState('editar'); // 'nuevo' | 'editar'

  const [nuevoProducto, setNuevoProducto] = useState({
    IdProducto: '',
    NombreProducto: '',
    Descripcion: '',
    Valor: '',
    Stock: '',
    ImageUrl: '',
    VideoUrl: '',
    ConDescuento: false
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const cardSize = isMobile ? "300px" : "340px";

  useEffect(() => {
    recargarProductos();
  }, []);

  const recargarProductos = async () => {
    const timestamp = Date.now();
    const data = await cargarProductos(`https://rosmiyasc.s3.us-east-2.amazonaws.com/Productos.xlsx?t=${timestamp}`);

    const ordenados = [...data].sort((a, b) => String(a.IdProducto).localeCompare(String(b.IdProducto)));


    setProductos(ordenados);
  };

  const handleEditar = (index) => {
    setModoFormulario('editar');
    setSelected(index);
    setNuevoProducto({ ...productos[index] });

    if (isMobile) {
      setDialogEditarOpen(true);
    } else {
      setMostrarFormulario(index);
    }
  };



  const handleCancelar = () => {
    setModoFormulario('editar');
    setPreviewImagen(null);
    setSelected(null);
    setMostrarFormulario(null);
    setDialogEditarOpen(false);
  };

  useEffect(() => {
    if (dialogEditarOpen) {
      setImagenActualizada(false);
    }
  }, [dialogEditarOpen]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleGuardar = async () => {
    if (!nuevoProducto.NombreProducto || !nuevoProducto.Valor || isNaN(nuevoProducto.Valor)) {
      setSnackbar({ open: true, message: 'Por favor completa los campos obligatorios.' });
      return;
    }

    const url = `${functionsBaseUrl}/.netlify/functions/actualizarProducto`;
    setActualizando(true);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ producto: nuevoProducto }),
      });

      await res.json();

      setSnackbar({
        open: true,
        message:
          modoFormulario === 'nuevo'
            ? 'Producto creado correctamente 🎉'
            : 'Producto actualizado correctamente ✏️',
      });

      await recargarProductos();
      handleCancelar();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Error al guardar producto' });
    } finally {
      setActualizando(false);
    }
  };


  const handleEliminar = (producto) => {
    setProductoAEliminar(producto);
  };

  const confirmarEliminar = async () => {

    if (productoAEliminar === null) return;
    setEliminando(true);
    try {
      const producto = productoAEliminar;
      console.log("🚨 Producto a eliminar:", productoAEliminar);
      console.log("🚨 IdProducto enviado:", productoAEliminar?.IdProducto);

      const url = `${window.location.hostname === 'localhost' ? 'http://localhost:8888' : ''}/.netlify/functions/eliminarProducto`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ IdProducto: producto.IdProducto })

      });
      const result = await res.json();
      setSnackbar({ open: true, message: result.message || 'Producto eliminado.' });
      await recargarProductos();
    } catch (err) {
      console.error('❌ Error al eliminar producto:', err);
      setSnackbar({ open: true, message: 'Error al eliminar producto' });
    } finally {
      setProductoAEliminar(null);
      setEliminando(false);
    }
  };

  const confirmarRestaurar = async () => {
    setRestaurando(true);
    try {
      const url = `${window.location.hostname === 'localhost' ? 'http://localhost:8888' : ''}/.netlify/functions/restaurarProductos`;
      const res = await fetch(url, { method: 'POST' });
      const result = await res.json();
      setSnackbar({ open: true, message: result.message || 'Productos restaurados' });
      await recargarProductos();
    } catch (err) {
      console.error('❌ Error al restaurar productos:', err);
      setSnackbar({ open: true, message: 'Error al restaurar productos' });
    } finally {
      setRestaurarOpen(false);
      setRestaurando(false);
    }
  };

  const obtenerSiguienteIdProducto = () => {
    if (!productos.length) return 1;

    const maxId = Math.max(
      ...productos
        .map(p => Number(p.IdProducto))
        .filter(id => !Number.isNaN(id))
    );

    return maxId + 1;
  };


  return (
    <Container maxWidth={false} disableGutters sx={{ minHeight: '100vh', width: '100vw', overflowX: 'hidden', py: 1, px: 0, pb: 2, backgroundImage: 'url(fondo-blizz-ivelpink.webp)', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed', backgroundPosition: 'center' }}>
      <Box sx={{ pt: 14, px: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <SettingsSuggestIcon sx={{ color: 'white', fontSize: 22 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, fontFamily: 'Roboto, Arial, sans-serif', fontSize: { xs: '0.8rem', sm: '1.25rem' } }}>
              {"Productos actuales".split("").map((char, i) => (
                <motion.span key={i} custom={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }} style={{ display: 'inline-block' }}>
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              const nextId = obtenerSiguienteIdProducto();

              setModoFormulario('nuevo');
              setSelected(null);
              setNuevoProducto({
                IdProducto: nextId, // ✅ INT autoincrement real
                NombreProducto: '',
                Descripcion: '',
                Valor: '',
                Stock: '',
                ImageUrl: '',
                VideoUrl: '',
                ConDescuento: false,
              });

              setDialogEditarOpen(true);
            }}

            sx={{
              fontSize: { xs: '0.8rem', sm: '1.25rem' },
              backgroundColor: '#7b4b5a',
              '&:hover': { backgroundColor: '#5a2e3b' },
            }}
          >
            Agregar
          </Button>

          {/*<Button variant="outlined" color="inherit" onClick={() => setRestaurarOpen(true)} startIcon={<UpdateIcon />} sx={{ fontSize: { xs: '0.5rem', sm: '1.25rem' }, color: 'white', borderColor: 'white', '&:hover': { backgroundColor: '#ffffff22', borderColor: '#ffffffcc' } }}>Restaurar productos</Button>*/}
        </Box>

        <Grid container spacing={2}>
          <AnimatePresence>
            {productos.map((producto, idx) => (
              <Grid
                item
                xs={6}
                sm={6}
                md={4}
                lg={3}
                key={producto.IdProducto || idx}
              >
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -60 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  style={{ height: '100%' }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 2,
                      overflow: 'hidden',
                      position: 'relative',
                      color: 'white',
                    }}
                  >
                    {/* IMAGEN DE FONDO */}
                    <Box
                      sx={{
                        height: 160,
                        backgroundImage: `url(${producto.ImageUrl}?v=${producto.IdProducto}-${producto.Valor})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                      }}
                    >

                      {/* OVERLAY */}
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.2))',
                        }}
                      />

                      {/* INFO */}
                      <Box sx={{ position: 'relative', p: 1.5 }}>
                        <Typography
                          fontWeight={700}
                          fontSize="0.9rem"
                          noWrap
                        >
                          {producto.NombreProducto}
                        </Typography>

                        <Typography fontSize="0.75rem">
                          ${producto.Valor} USD
                        </Typography>

                        <Typography fontSize="0.7rem" opacity={0.85}>
                          Stock: {producto.Stock}
                        </Typography>
                      </Box>

                      {/* BOTONES */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          display: 'flex',
                          gap: 0.5,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (isMobile) {
                              handleEditar(idx);
                            } else {
                              mostrarFormulario === idx
                                ? handleCancelar()
                                : handleEditar(idx);
                            }
                          }}

                          sx={{
                            backgroundColor: '#00000088',
                            color: 'white',
                            '&:hover': { backgroundColor: '#000000cc' },
                          }}
                        >
                          {mostrarFormulario === idx ? <CloseIcon /> : <EditIcon />}
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => handleEliminar(producto)}
                          sx={{
                            backgroundColor: '#00000088',
                            color: 'white',
                            '&:hover': { backgroundColor: '#000000cc' },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* FORMULARIO */}
                    <Collapse
                      in={mostrarFormulario === idx}
                      timeout={400}
                      unmountOnExit
                    >
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: '#fff',
                          color: '#000',
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Nombre"
                              name="NombreProducto"
                              value={nuevoProducto.NombreProducto}
                              onChange={handleInputChange}
                            />
                          </Grid>

                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Precio"
                              name="Valor"
                              type="number"
                              value={nuevoProducto.Valor}
                              onChange={handleInputChange}
                            />
                          </Grid>

                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Stock"
                              name="Stock"
                              type="number"
                              value={nuevoProducto.Stock}
                              onChange={handleInputChange}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={nuevoProducto.ConDescuento}
                                  onChange={handleInputChange}
                                  name="ConDescuento"
                                />
                              }
                              label="¿Producto con descuento?"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Descripción"
                              name="Descripcion"
                              value={nuevoProducto.Descripcion}
                              onChange={handleInputChange}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Imagen URL"
                              name="ImageUrl"
                              value={nuevoProducto.ImageUrl}
                              onChange={handleInputChange}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Video URL"
                              name="VideoUrl"
                              value={nuevoProducto.VideoUrl}
                              onChange={handleInputChange}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Box display="flex" gap={1}>
                              <Button
                                variant="contained"
                                onClick={handleGuardar}
                                disabled={actualizando}
                                fullWidth
                                startIcon={<UpdateIcon />}
                              >
                                Guardar
                              </Button>

                              <Button
                                variant="outlined"
                                onClick={handleCancelar}
                                fullWidth
                              >
                                Cancelar
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>

        {/* EDITAR PRODUCTO */}
        <Dialog
          fullScreen
          open={dialogEditarOpen}
          onClose={handleCancelar}
        >
          {/* HEADER */}
          <AppBar
            sx={{
              position: 'relative',
              background: 'linear-gradient(135deg, #5a2e3b, #7b4b5a)',
            }}
          >
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={handleCancelar}>
                <CloseIcon />
              </IconButton>
              <Typography sx={{ ml: 2, fontWeight: 600 }} variant="h6">
                {modoFormulario === 'nuevo'
                  ? '➕ Nuevo Producto'
                  : '✂️ Editar Producto'}
              </Typography>
            </Toolbar>
          </AppBar>

          {/* CONTENIDO */}
          <Box sx={{ p: 1, backgroundColor: '#f5f2f3', minHeight: '100%' }}>
            <Paper
              elevation={4}
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: '#faf7f8',
              }}
            >
              <Grid container spacing={2}>
                {/* NOMBRE */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="👗 Nombre de la prenda"
                    name="NombreProducto"
                    value={nuevoProducto.NombreProducto}
                    onChange={handleInputChange}
                    InputProps={{
                      sx: { backgroundColor: '#fff', borderRadius: 2 },
                    }}
                  />
                </Grid>

                {/* PRECIO / STOCK */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="💰 Precio"
                    name="Valor"
                    type="number"
                    value={nuevoProducto.Valor}
                    onChange={handleInputChange}
                    InputProps={{
                      sx: { backgroundColor: '#fff', borderRadius: 2 },
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="📦 Unidades disponibles"
                    name="Stock"
                    type="number"
                    value={nuevoProducto.Stock}
                    onChange={handleInputChange}
                    InputProps={{
                      sx: { backgroundColor: '#fff', borderRadius: 2 },
                    }}
                  />
                </Grid>

                {/* DESCUENTO */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={nuevoProducto.ConDescuento}
                        onChange={handleInputChange}
                        name="ConDescuento"
                        sx={{ color: '#5a2e3b' }}
                      />
                    }
                    label="🏷️ Prenda con descuento"
                  />
                </Grid>

                {/* DESCRIPCIÓN */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    label="🧵 Detalles de la prenda"
                    name="Descripcion"
                    value={nuevoProducto.Descripcion}
                    onChange={handleInputChange}
                    InputProps={{
                      sx: { backgroundColor: '#fff', borderRadius: 2 },
                    }}
                  />
                </Grid>

                {/* IMAGEN */}
                <Grid item xs={12}>

                  <Grid item xs={12}>
                    <Button
                      component="label"
                      fullWidth
                      variant="outlined"
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      📤 Subir foto de la prenda
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          // 👉 1. Preview inmediato
                          // Preview inmediato
                          const previewUrl = URL.createObjectURL(file);
                          setPreviewImagen(previewUrl);

                          // ⏳ feedback inmediato
                          setSubiendoImagen(true);


                          // 👉 2. Subida real a S3
                          const reader = new FileReader();

                          reader.onloadend = async () => {
                            try {
                              const base64 = reader.result.split(',')[1];

                              const res = await fetch(
                                `${functionsBaseUrl}/.netlify/functions/subirImagenProducto`,
                                {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    fileBase64: base64,
                                    contentType: file.type,
                                    productoId: nuevoProducto.IdProducto, // 🔥 CLAVE
                                  }),
                                }
                              );

                              if (!res.ok) {
                                throw new Error('Error al subir imagen');
                              }

                              const { url } = await res.json();

                              setNuevoProducto((prev) => ({
                                ...prev,
                                ImageUrl: `${url}?v=${Date.now()}`,
                              }));

                              setSubiendoImagen(false); // 🔥 APAGAR
                              setImagenActualizada(true);

                              setTimeout(() => {
                                setImagenActualizada(false);
                              }, 2000);


                            } catch (err) {
                              console.error(err);
                              setSnackbar({
                                open: true,
                                message: 'Error al subir la imagen',
                              });
                              setPreviewImagen(null);
                              setSubiendoImagen(false);

                            } finally {
                              URL.revokeObjectURL(previewUrl);
                            }
                          };

                          reader.readAsDataURL(file);
                        }}
                      />


                    </Button>

                    {(previewImagen || nuevoProducto.ImageUrl) && (
                      <Box
                        mt={2}
                        sx={{
                          height: 220,
                          borderRadius: 3,
                          backgroundImage: `url(${previewImagen || nuevoProducto.ImageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <AnimatePresence>
                          {/* ⏳ SUBIENDO */}
                          {subiendoImagen && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundColor: 'rgba(0,0,0,0.45)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 2,
                              }}
                            >
                              <Typography
                                sx={{
                                  color: 'white',
                                  fontWeight: 600,
                                  background: 'rgba(0,0,0,0.35)',
                                  px: 2,
                                  py: 1,
                                  borderRadius: 2,
                                }}
                              >
                                ⏳ Subiendo imagen…
                              </Typography>
                            </motion.div>
                          )}

                          {/* ✅ OK */}
                          {imagenActualizada && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundColor: 'rgba(46, 125, 50, 0.55)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 3,
                              }}
                            >
                              <Typography
                                sx={{
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: '1rem',
                                  background: 'rgba(0,0,0,0.35)',
                                  px: 2,
                                  py: 1,
                                  borderRadius: 2,
                                }}
                              >
                                ✅ Imagen subida! No olvidar Guardar 💾
                              </Typography>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Box>
                    )}


                  </Grid>

                </Grid>

                {/* VIDEO */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="🎥 Video del proceso (URL)"
                    name="VideoUrl"
                    value={nuevoProducto.VideoUrl}
                    onChange={handleInputChange}
                    InputProps={{
                      sx: { backgroundColor: '#fff', borderRadius: 2 },
                    }}
                  />

                  {nuevoProducto.VideoUrl && (
                    <Box
                      mt={1.5}
                      display="flex"
                      alignItems="center"
                      gap={1}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setDialogVideoOpen(true)}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 30,
                          borderRadius: 2,
                          backgroundColor: '#FF0000', // 🔴 YouTube red
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(255,0,0,0.35)',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </Box>

                      <Typography variant="caption" color="text.secondary">
                        👀 Ver detalle de confección
                      </Typography>
                    </Box>
                  )}
                </Grid>

                {/* BOTONES */}
                <Grid item xs={12}>
                  <Box display="flex" gap={1} mt={1}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<UpdateIcon />}
                      onClick={handleGuardar}
                      disabled={actualizando}
                      sx={{
                        backgroundColor: '#5a2e3b',
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: '#7b4b5a',
                        },
                      }}
                    >
                      Guardar
                    </Button>

                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleCancelar}
                      sx={{
                        borderRadius: 3,
                        textTransform: 'none',
                      }}
                    >
                      ❌ Cancelar
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Dialog>


        {/*VIDEO*/}
        <Dialog
          fullScreen
          open={dialogVideoOpen}
          onClose={() => setDialogVideoOpen(false)}
        >
          <AppBar sx={{ position: 'relative', background: '#000' }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setDialogVideoOpen(false)}
              >
                <CloseIcon />
              </IconButton>
              <Typography sx={{ ml: 2 }} variant="h6">
                Detalle de confección
              </Typography>
            </Toolbar>
          </AppBar>

          <Box
            sx={{
              flex: 1,
              backgroundColor: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <video
              src={nuevoProducto.VideoUrl}
              controls
              autoPlay
              style={{
                width: '100%',
                maxHeight: '100%',
              }}
            />
          </Box>
        </Dialog>

        <DialogEliminarProducto
          open={productoAEliminar !== null}
          producto={productoAEliminar}
          eliminando={eliminando}
          onClose={() => !eliminando && setProductoAEliminar(null)}
          onConfirm={confirmarEliminar}
        />

        <DialogRestaurarProductos open={restaurarOpen} restaurando={restaurando} onClose={() => !restaurando && setRestaurarOpen(false)} onConfirm={confirmarRestaurar} />
        <MenuInferior cardSize={cardSize} modo="configurar-productos" />
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="success" sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default ConfigurarProductos;
