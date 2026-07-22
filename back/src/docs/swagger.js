/* | Nombre: swagger.js | Finalidad: Configura las opciones y esquemas de documentación de la API con Swagger. */

const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DisWebTienda API",
      version: "1.0.0",
      description: "API backend para tienda digital de libros electrónicos (eBooks) en PDF",
      contact: {
        name: "Karina Flores",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token de autenticación JWT"
        }
      },
      schemas: {
        Perfil: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            nombre: { type: "string" },
            apellido: { type: "string" },
            telefono: { type: "string" },
            direccion: { type: "string" },
            correo: { type: "string", format: "email" },
            rol: { type: "string", enum: ["super", "admin", "cliente", "proveedor", "reporte"] },
            creado_al: { type: "string", format: "date-time" },
            actualizado_al: { type: "string", format: "date-time" }
          }
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" }
          }
        }
      }
    },
    paths: {
      // ── Health ────────────────────────────────────
      "/health": {
        get: {
          tags: ["Salud"],
          summary: "Verificar estado del servidor",
          description: "Endpoint sin autenticación que retorna el estado del servidor, fecha/hora y tiempo en línea.",
          responses: {
            200: {
              description: "Servidor activo",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      mensaje: { type: "string", example: "Hola mundo mundial, estoy vivo :) 🚀" },
                      servidor: {
                        type: "object",
                        properties: {
                          fechaHora: { type: "string", format: "date-time" },
                          zonaHoraria: { type: "string" }
                        }
                      },
                      tiempoEnLinea: { type: "string", example: "2h 15m 30s" }
                    }
                  }
                }
              }
            }
          }
        }
      },

      // ── Auth ──────────────────────────────────────
      "/api/auth/registro": {
        post: {
          tags: ["Autenticación"],
          summary: "Registrar nuevo cliente",
          description: "Crea un nuevo usuario con rol de cliente por defecto.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["nombre", "apellido", "email", "password"],
                  properties: {
                    nombre: { type: "string", example: "Juan" },
                    apellido: { type: "string", example: "Pérez" },
                    telefono: { type: "string", example: "999888777" },
                    direccion: { type: "string", example: "Av. Principal 123" },
                    email: { type: "string", format: "email", example: "juan@email.com" },
                    password: { type: "string", minLength: 6, example: "password123" }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Cliente registrado exitosamente" },
            400: { description: "Error en los datos o usuario ya existe" }
          }
        }
      },

      "/api/auth/registro-proveedor": {
        post: {
          tags: ["Autenticación"],
          summary: "Registrar nuevo proveedor",
          description: "Crea un nuevo usuario con rol de proveedor.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["nombre", "apellido", "email", "password"],
                  properties: {
                    nombre: { type: "string", example: "Editorial" },
                    apellido: { type: "string", example: "ABC" },
                    telefono: { type: "string", example: "999888777" },
                    direccion: { type: "string", example: "Calle Falsa 456" },
                    email: { type: "string", format: "email", example: "contacto@editorial-abc.com" },
                    password: { type: "string", minLength: 6, example: "password123" }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Proveedor registrado exitosamente" },
            400: { description: "Error en los datos o usuario ya existe" }
          }
        }
      },

      "/api/auth/login": {
        post: {
          tags: ["Autenticación"],
          summary: "Iniciar sesión",
          description: "Autentica al usuario y retorna JWT con su perfil y rol.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
            correo: { type: "string", format: "email" },
                    password: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Login exitoso, retorna token y perfil" },
            401: { description: "Credenciales inválidas" }
          }
        }
      },

      "/api/auth/reset-password": {
        post: {
          tags: ["Autenticación"],
          summary: "Solicitar reset de contraseña",
          description: "Envía un email con enlace para restablecer la contraseña.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: {
                    email: { type: "string", format: "email" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Email enviado (si el usuario existe)" }
          }
        },
        put: {
          tags: ["Autenticación"],
          summary: "Establecer nueva contraseña",
          description: "Actualiza la contraseña usando los tokens del email de reset.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["access_token", "refresh_token", "new_password"],
                  properties: {
                    access_token: { type: "string" },
                    refresh_token: { type: "string" },
                    new_password: { type: "string", minLength: 6 }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Contraseña actualizada" },
            400: { description: "Tokens inválidos o expirados" }
          }
        }
      },

      "/api/auth/perfil": {
        get: {
          tags: ["Autenticación"],
          summary: "Obtener perfil del usuario autenticado",
          description: "Retorna el perfil completo del usuario logueado.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Perfil obtenido" },
            401: { description: "No autenticado" }
          }
        },
        put: {
          tags: ["Autenticación"],
          summary: "Actualizar perfil del usuario autenticado",
          description: "Actualiza nombre, apellido, teléfono y dirección.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    nombre: { type: "string" },
                    apellido: { type: "string" },
                    telefono: { type: "string" },
                    direccion: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Perfil actualizado" },
            401: { description: "No autenticado" }
          }
        }
      },

      // ── Usuarios (CRUD) ───────────────────────────
      "/api/usuarios": {
        get: {
          tags: ["Usuarios"],
          summary: "Listar todos los usuarios",
          description: "Requiere rol de admin o super.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Lista de usuarios" },
            401: { description: "No autenticado" },
            403: { description: "No autorizado (se requiere admin o super)" }
          }
        }
      },

      "/api/usuarios/{id}": {
        get: {
          tags: ["Usuarios"],
          summary: "Obtener usuario por ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: { description: "Usuario encontrado" },
            404: { description: "Usuario no encontrado" }
          }
        },
        put: {
          tags: ["Usuarios"],
          summary: "Actualizar usuario",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    nombre: { type: "string" },
                    apellido: { type: "string" },
                    telefono: { type: "string" },
                    direccion: { type: "string" },
                    rol: { type: "string", enum: ["super", "admin", "cliente", "proveedor", "reporte"] }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Usuario actualizado" },
            404: { description: "Usuario no encontrado" }
          }
        },
        delete: {
          tags: ["Usuarios"],
          summary: "Eliminar usuario",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: { description: "Usuario eliminado" },
            403: { description: "No se puede eliminar un usuario super" },
            404: { description: "Usuario no encontrado" }
          }
        }
      }
    }
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
