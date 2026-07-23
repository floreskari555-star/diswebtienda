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
        Libro: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            titulo: { type: "string", example: "El Arte de la Guerra" },
            autor: { type: "string", example: "Sun Tzu" },
            descripcion: { type: "string", example: "Descripción del libro" },
            sinopsis: { type: "string", example: "Un tratado militar clásico..." },
            anio: { type: "integer", example: 2020 },
            editorial_id: { type: "string", format: "uuid", description: "ID de la editorial" },
            precio: { type: "number", format: "float", example: 29.90 },
            portada_url: { type: "string", example: "https://storage.supabase.co/libreria/libro1.png" },
            archivo_pdf_ruta: { type: "string", example: "libro1.pdf" },
            activo: { type: "boolean", example: true },
            creado_el: { type: "string", format: "date-time" },
            actualizado_el: { type: "string", format: "date-time" },
            editoriales: {
              type: "object",
              description: "Objeto de editorial (incluido en queries con JOIN)",
              properties: {
                id: { type: "string", format: "uuid" },
                nombre: { type: "string", example: "Editorial Clásicos" }
              }
            }
          }
        },
        Editorial: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            nombre: { type: "string", example: "Editorial Planeta" },
            correo_contacto: { type: "string", format: "email", example: "contacto@planeta.com" },
            creado_el: { type: "string", format: "date-time" }
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
          description: "Autentica al usuario y retorna JWT con su perfil y rol. Acepta 'email' o 'correo'.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["password"],
                  properties: {
                    email: { type: "string", format: "email", description: "Email del usuario (alternativa: correo)" },
                    correo: { type: "string", format: "email", description: "Correo del usuario (alternativa: email)" },
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
      },

      // ── Libros (CRUD) ───────────────────────────
      "/api/libros": {
        get: {
          tags: ["Libros"],
          summary: "Listar libros del catálogo",
          description: "Retorna todos los libros activos. Filtros opcionales: editorial_id, search, activo.",
          parameters: [
            { name: "editorial_id", in: "query", schema: { type: "string", format: "uuid" }, description: "Filtrar por ID de editorial" },
            { name: "search", in: "query", schema: { type: "string" }, description: "Buscar por título o autor" },
            { name: "activo", in: "query", schema: { type: "string", enum: ["true", "false"] }, description: "Filtrar por estado (solo admin)" }
          ],
          responses: {
            200: {
              description: "Lista de libros",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      total: { type: "integer" },
                      libros: { type: "array", items: { "$ref": "#/components/schemas/Libro" } }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ["Libros"],
          summary: "Crear nuevo libro",
          description: "Requiere rol de admin o super. Acepta multipart/form-data para subir archivos.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["titulo", "autor", "editorial_id", "precio"],
                  properties: {
                    titulo: { type: "string", example: "El Arte de la Guerra" },
                    autor: { type: "string", example: "Sun Tzu" },
                    editorial_id: { type: "string", format: "uuid", description: "ID de la editorial" },
                    precio: { type: "number", example: 29.90 },
                    descripcion: { type: "string", example: "Descripción del libro" },
                    sinopsis: { type: "string", example: "Un tratado militar clásico..." },
                    anio: { type: "integer", example: 2020 },
                    activo: { type: "boolean", example: true },
                    portada: { type: "string", format: "binary", description: "Imagen de portada (PNG/JPG)" },
                    archivo_pdf: { type: "string", format: "binary", description: "Archivo PDF del libro" }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Libro creado exitosamente" },
            400: { description: "Datos inválidos" },
            401: { description: "No autenticado" },
            403: { description: "No autorizado (se requiere admin o super)" }
          }
        }
      },

      "/api/libros/editoriales": {
        get: {
          tags: ["Libros"],
          summary: "Listar editoriales disponibles",
          description: "Retorna la lista de editoriales registradas.",
          responses: {
            200: {
              description: "Lista de editoriales",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      editoriales: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid" },
                            nombre: { type: "string" },
                            correo_contacto: { type: "string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },

      "/api/libros/{id}": {
        get: {
          tags: ["Libros"],
          summary: "Obtener libro por ID",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: {
              description: "Libro encontrado",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      libro: { "$ref": "#/components/schemas/Libro" }
                    }
                  }
                }
              }
            },
            404: { description: "Libro no encontrado" }
          }
        },
        put: {
          tags: ["Libros"],
          summary: "Actualizar libro",
          description: "Requiere rol de admin o super. Acepta multipart/form-data para actualizar archivos.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    titulo: { type: "string" },
                    autor: { type: "string" },
                    editorial_id: { type: "string", format: "uuid" },
                    precio: { type: "number" },
                    descripcion: { type: "string" },
                    sinopsis: { type: "string" },
                    anio: { type: "integer" },
                    activo: { type: "boolean" },
                    portada: { type: "string", format: "binary", description: "Nueva portada (opcional)" },
                    archivo_pdf: { type: "string", format: "binary", description: "Nuevo PDF (opcional)" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Libro actualizado" },
            404: { description: "Libro no encontrado" }
          }
        },
        delete: {
          tags: ["Libros"],
          summary: "Eliminar libro",
          description: "Requiere rol de admin o super. Elimina archivos del storage.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: { description: "Libro eliminado" },
            404: { description: "Libro no encontrado" }
          }
        }
      },

      // ── Editoriales (CRUD) ─────────────────────────
      "/api/editoriales": {
        get: {
          tags: ["Editoriales"],
          summary: "Listar todas las editoriales",
          description: "Retorna la lista de editoriales ordenadas por nombre.",
          responses: {
            200: {
              description: "Lista de editoriales",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      total: { type: "integer" },
                      editoriales: { type: "array", items: { "$ref": "#/components/schemas/Editorial" } }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ["Editoriales"],
          summary: "Crear nueva editorial",
          description: "Requiere rol de admin o super.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["nombre"],
                  properties: {
                    nombre: { type: "string", example: "Editorial Planeta" },
                    correo_contacto: { type: "string", format: "email", example: "contacto@planeta.com" }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Editorial creada exitosamente" },
            400: { description: "Datos inválidos o nombre duplicado" },
            401: { description: "No autenticado" },
            403: { description: "No autorizado (se requiere admin o super)" }
          }
        }
      },

      "/api/editoriales/{id}": {
        get: {
          tags: ["Editoriales"],
          summary: "Obtener editorial por ID",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: {
              description: "Editorial encontrada",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      editorial: { "$ref": "#/components/schemas/Editorial" }
                    }
                  }
                }
              }
            },
            404: { description: "Editorial no encontrada" }
          }
        },
        put: {
          tags: ["Editoriales"],
          summary: "Actualizar editorial",
          description: "Requiere rol de admin o super.",
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
                    correo_contacto: { type: "string", format: "email" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Editorial actualizada" },
            400: { description: "Nombre duplicado" },
            404: { description: "Editorial no encontrada" }
          }
        },
        delete: {
          tags: ["Editoriales"],
          summary: "Eliminar editorial",
          description: "Requiere rol de admin o super. No se puede eliminar si tiene libros asociados.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: { description: "Editorial eliminada" },
            400: { description: "Tiene libros asociados" },
            404: { description: "Editorial no encontrada" }
          }
        }
      }
    }
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
