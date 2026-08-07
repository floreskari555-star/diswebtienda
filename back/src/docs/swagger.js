/* | Nombre: swagger.js | Finalidad: Configura las opciones y esquemas de documentación de la API con Swagger. */

const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LibrosLibres Librería API",
      version: "1.0.0",
      description: "API backend para tienda digital de libros electrónicos (eBooks) en PDF",
      contact: {
        name: "Karina Flores",
      },
    },
    servers: [
      {
        url: "https://diswebtienda.onrender.com",
        description: "Producción (Render)",
      },
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
            apellido_paterno: { type: "string" },
            apellido_materno: { type: "string" },
            tipo_documento: { type: "string", enum: ["DNI", "RUC", "CE", "PASSPORT", "PTP", "CarnetRefug"] },
            numero_documento: { type: "string" },
            departamento: { type: "string" },
            provincia: { type: "string" },
            distrito: { type: "string" },
            ubigeo: { type: "string", description: "Código ubigeo de 6 dígitos" },
            telefono: { type: "string" },
            direccion: { type: "string" },
            correo: { type: "string", format: "email" },
            rol: { type: "string", enum: ["super", "admin", "cliente", "proveedor", "reporte"] },
            editorial_id: { type: "string", format: "uuid", nullable: true },
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
            descripcion: { type: "string" },
            sinopsis: { type: "string" },
            anio: { type: "integer" },
            editorial_id: { type: "string", format: "uuid" },
            precio: { type: "number", format: "float", example: 29.90 },
            portada_url: { type: "string" },
            archivo_pdf_ruta: { type: "string" },
            activo: { type: "boolean" },
            creado_el: { type: "string", format: "date-time" },
            actualizado_el: { type: "string", format: "date-time" }
          }
        },
        Editorial: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            nombre: { type: "string", example: "Editorial Planeta" },
            correo_contacto: { type: "string", format: "email" },
            creado_el: { type: "string", format: "date-time" }
          }
        },
        SolicitudDerechos: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            usuario_id: { type: "string", format: "uuid" },
            editorial_id: { type: "string", format: "uuid" },
            titulo: { type: "string" },
            autor: { type: "string" },
            descripcion: { type: "string" },
            sinopsis: { type: "string" },
            anio: { type: "integer" },
            precio: { type: "number", format: "float" },
            monto_derechos: { type: "number", format: "float" },
            observaciones: { type: "string" },
            estado: { type: "string", enum: ["pendiente", "en_revision", "aprobada", "rechazada", "archivada"] },
            creado_el: { type: "string", format: "date-time" },
            actualizado_el: { type: "string", format: "date-time" }
          }
        },
        PagoEditorial: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            solicitud_id: { type: "string", format: "uuid" },
            usuario_id: { type: "string", format: "uuid" },
            editorial_id: { type: "string", format: "uuid" },
            monto: { type: "number", format: "float" },
            comprobante_url: { type: "string" },
            numero_operacion: { type: "string" },
            fecha_pago: { type: "string", format: "date" },
            observaciones: { type: "string" },
            estado: { type: "string", enum: ["pendiente", "aprobado", "rechazado"] },
            motivo_rechazo: { type: "string" },
            creado_el: { type: "string", format: "date-time" },
            actualizado_el: { type: "string", format: "date-time" }
          }
        },
        Factura: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            tipo_comprobante: { type: "string", enum: ["BOLETA", "FACTURA"] },
            numero_documento: { type: "string", example: "B001-0000001" },
            cliente_id: { type: "string", format: "uuid", nullable: true },
            cliente_nombre: { type: "string" },
            cliente_apellido_paterno: { type: "string" },
            cliente_apellido_materno: { type: "string" },
            cliente_numero_doc: { type: "string" },
            cliente_direccion: { type: "string" },
            subtotal: { type: "number", format: "float" },
            igv: { type: "number", format: "float" },
            total: { type: "number", format: "float" },
            estado: { type: "string", enum: ["Valido", "Anulado"] },
            dia: { type: "integer" },
            mes: { type: "integer" },
            anio: { type: "integer" },
            creado_el: { type: "string", format: "date-time" }
          }
        },
        FacturaDetalle: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            factura_id: { type: "string", format: "uuid" },
            numero_item: { type: "integer" },
            codigo: { type: "string" },
            descripcion: { type: "string" },
            precio_unitario: { type: "number", format: "float" },
            cantidad: { type: "integer" },
            total_item: { type: "number", format: "float" },
            creado_el: { type: "string", format: "date-time" }
          }
        },
        TablaMaestra: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            tabla: { type: "string", example: "TipoDocumento" },
            clave: { type: "string", example: "DNI" },
            valor: { type: "string", example: "DNI - Documento Nacional de Identidad" },
            orden: { type: "integer" },
            activo: { type: "boolean" },
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
          description: "Endpoint sin autenticación que retorna el estado del servidor y tiempo en línea.",
          responses: {
            200: { description: "Servidor activo" }
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
                  required: ["nombre", "apellido_paterno", "email", "password"],
                  properties: {
                    nombre: { type: "string", example: "Juan" },
                    apellido_paterno: { type: "string", example: "Pérez" },
                    apellido_materno: { type: "string", example: "López" },
                    tipo_documento: { type: "string", example: "DNI" },
                    numero_documento: { type: "string", example: "12345678" },
                    departamento: { type: "string", example: "Lima" },
                    provincia: { type: "string", example: "Lima" },
                    distrito: { type: "string", example: "Cercado de Lima" },
                    ubigeo: { type: "string", example: "150101" },
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
                  required: ["nombre", "apellido_paterno", "email", "password"],
                  properties: {
                    nombre: { type: "string", example: "Editorial" },
                    apellido_paterno: { type: "string", example: "ABC" },
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
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Perfil obtenido" },
            401: { description: "No autenticado" }
          }
        },
        put: {
          tags: ["Autenticación"],
          summary: "Actualizar perfil del usuario autenticado",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    nombre: { type: "string" },
                    apellido_paterno: { type: "string" },
                    apellido_materno: { type: "string" },
                    tipo_documento: { type: "string" },
                    numero_documento: { type: "string" },
                    departamento: { type: "string" },
                    provincia: { type: "string" },
                    distrito: { type: "string" },
                    ubigeo: { type: "string" },
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
            403: { description: "No autorizado" }
          }
        }
      },

      "/api/usuarios/proveedores-sin-editorial": {
        get: {
          tags: ["Usuarios"],
          summary: "Proveedores sin editorial asociada",
          description: "Retorna proveedores que no tienen editorial_id asignado. Solo admin.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Lista de proveedores" }
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
                    apellido_paterno: { type: "string" },
                    apellido_materno: { type: "string" },
                    tipo_documento: { type: "string" },
                    numero_documento: { type: "string" },
                    telefono: { type: "string" },
                    direccion: { type: "string" },
                    rol: { type: "string", enum: ["super", "admin", "cliente", "proveedor", "reporte"] },
                    editorial_id: { type: "string", format: "uuid", nullable: true }
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
          description: "Retorna todos los libros activos. Filtros opcionales.",
          parameters: [
            { name: "editorial_id", in: "query", schema: { type: "string", format: "uuid" } },
            { name: "search", in: "query", schema: { type: "string" }, description: "Buscar por título o autor" },
            { name: "activo", in: "query", schema: { type: "string", enum: ["true", "false"] } },
            { name: "precio_min", in: "query", schema: { type: "number" }, description: "Precio mínimo" },
            { name: "precio_max", in: "query", schema: { type: "number" }, description: "Precio máximo" }
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
          description: "Requiere admin o super. Acepta multipart/form-data.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["titulo", "autor", "editorial_id", "precio"],
                  properties: {
                    titulo: { type: "string" },
                    autor: { type: "string" },
                    editorial_id: { type: "string", format: "uuid" },
                    precio: { type: "number" },
                    descripcion: { type: "string" },
                    sinopsis: { type: "string" },
                    anio: { type: "integer" },
                    activo: { type: "boolean" },
                    portada: { type: "string", format: "binary" },
                    archivo_pdf: { type: "string", format: "binary" }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Libro creado" },
            400: { description: "Datos inválidos" },
            403: { description: "No autorizado" }
          }
        }
      },

      "/api/libros/editoriales": {
        get: {
          tags: ["Libros"],
          summary: "Listar editoriales disponibles",
          responses: {
            200: { description: "Lista de editoriales" }
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
            200: { description: "Libro encontrado" },
            404: { description: "Libro no encontrado" }
          }
        },
        put: {
          tags: ["Libros"],
          summary: "Actualizar libro",
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
                    portada: { type: "string", format: "binary" },
                    archivo_pdf: { type: "string", format: "binary" }
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
          description: "Elimina archivos del storage.",
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
          description: "Requiere admin o super.",
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
                    correo_contacto: { type: "string", format: "email" }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Editorial creada" },
            400: { description: "Nombre duplicado" },
            403: { description: "No autorizado" }
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
            200: { description: "Editorial encontrada" },
            404: { description: "No encontrada" }
          }
        },
        put: {
          tags: ["Editoriales"],
          summary: "Actualizar editorial",
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
            404: { description: "No encontrada" }
          }
        },
        delete: {
          tags: ["Editoriales"],
          summary: "Eliminar editorial",
          description: "No se puede eliminar si tiene libros asociados.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: { description: "Editorial eliminada" },
            400: { description: "Tiene libros asociados" },
            404: { description: "No encontrada" }
          }
        }
      },

      // ── Solicitudes de Derechos ─────────────────────
      "/api/solicitudes": {
        get: {
          tags: ["Solicitudes"],
          summary: "Listar solicitudes de derechos",
          description: "Admin ve todas, proveedor ve las suyas.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "estado", in: "query", schema: { type: "string", enum: ["pendiente", "en_revision", "aprobada", "rechazada", "archivada"] } },
            { name: "editorial_id", in: "query", schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: { description: "Lista de solicitudes" },
            401: { description: "No autenticado" }
          }
        },
        post: {
          tags: ["Solicitudes"],
          summary: "Crear solicitud de derechos",
          description: "Proveedor o admin registran una propuesta de título.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["editorial_id", "titulo", "autor", "precio", "monto_derechos"],
                  properties: {
                    editorial_id: { type: "string", format: "uuid" },
                    titulo: { type: "string" },
                    autor: { type: "string" },
                    descripcion: { type: "string" },
                    sinopsis: { type: "string" },
                    anio: { type: "integer" },
                    precio: { type: "number" },
                    monto_derechos: { type: "number" },
                    observaciones: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Solicitud creada" },
            400: { description: "Datos inválidos" }
          }
        }
      },

      "/api/solicitudes/{id}": {
        get: {
          tags: ["Solicitudes"],
          summary: "Obtener solicitud por ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: { description: "Solicitud encontrada" },
            404: { description: "No encontrada" }
          }
        },
        put: {
          tags: ["Solicitudes"],
          summary: "Actualizar solicitud",
          description: "Solo si está pendiente o en revisión.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    editorial_id: { type: "string", format: "uuid" },
                    titulo: { type: "string" },
                    autor: { type: "string" },
                    precio: { type: "number" },
                    monto_derechos: { type: "number" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Solicitud actualizada" },
            400: { description: "Estado no permite edición" }
          }
        },
        delete: {
          tags: ["Solicitudes"],
          summary: "Eliminar solicitud",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: { description: "Solicitud eliminada" }
          }
        }
      },

      "/api/solicitudes/{id}/estado": {
        patch: {
          tags: ["Solicitudes"],
          summary: "Cambiar estado de solicitud",
          description: "Solo admin/super.",
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
                  required: ["estado"],
                  properties: {
                    estado: { type: "string", enum: ["pendiente", "en_revision", "aprobada", "rechazada", "archivada"] }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Estado actualizado" }
          }
        }
      },

      // ── Pagos a Editoriales ─────────────────────────
      "/api/pagos": {
        get: {
          tags: ["Pagos"],
          summary: "Listar pagos a editoriales",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "estado", in: "query", schema: { type: "string", enum: ["pendiente", "aprobado", "rechazado"] } },
            { name: "solicitud_id", in: "query", schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: { description: "Lista de pagos" }
          }
        },
        post: {
          tags: ["Pagos"],
          summary: "Registrar pago a editorial",
          description: "Proveedor o admin registran comprobante de pago.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["solicitud_id", "editorial_id", "monto"],
                  properties: {
                    solicitud_id: { type: "string", format: "uuid" },
                    editorial_id: { type: "string", format: "uuid" },
                    monto: { type: "number" },
                    numero_operacion: { type: "string" },
                    fecha_pago: { type: "string", format: "date" },
                    observaciones: { type: "string" },
                    comprobante: { type: "string", format: "binary" }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Pago registrado" }
          }
        }
      },

      "/api/pagos/{id}": {
        get: {
          tags: ["Pagos"],
          summary: "Obtener pago por ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: { description: "Pago encontrado" },
            404: { description: "No encontrado" }
          }
        },
        delete: {
          tags: ["Pagos"],
          summary: "Eliminar pago",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: { description: "Pago eliminado" }
          }
        }
      },

      "/api/pagos/{id}/aprobar": {
        patch: {
          tags: ["Pagos"],
          summary: "Aprobar pago",
          description: "Solo admin. Aprobación automática de la solicitud asociada.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: { description: "Pago aprobado" }
          }
        }
      },

      "/api/pagos/{id}/rechazar": {
        patch: {
          tags: ["Pagos"],
          summary: "Rechazar pago",
          description: "Solo admin. Requiere motivo.",
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
                  required: ["motivo_rechazo"],
                  properties: {
                    motivo_rechazo: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Pago rechazado" }
          }
        }
      },

      // ── Facturas / Comprobantes ─────────────────────
      "/api/facturas": {
        get: {
          tags: ["Facturas"],
          summary: "Listar todas las facturas (admin)",
          description: "Solo admin/super ven todas las facturas.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Lista de facturas con detalles",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      total: { type: "integer" },
                      facturas: { type: "array", items: { "$ref": "#/components/schemas/Factura" } }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ["Facturas"],
          summary: "Crear factura / boleta",
          description: "Genera comprobante con correlativo secuencial. Envía correo en background.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["tipo_comprobante", "detalles"],
                  properties: {
                    tipo_comprobante: { type: "string", enum: ["BOLETA", "FACTURA"] },
                    cliente_id: { type: "string", format: "uuid" },
                    cliente_nombre: { type: "string" },
                    cliente_apellido_paterno: { type: "string" },
                    cliente_apellido_materno: { type: "string" },
                    cliente_numero_doc: { type: "string" },
                    cliente_direccion: { type: "string" },
                    subtotal: { type: "number" },
                    igv: { type: "number" },
                    total: { type: "number" },
                    dia: { type: "integer" },
                    mes: { type: "integer" },
                    anio: { type: "integer" },
                    detalles: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          numero_item: { type: "integer" },
                          codigo: { type: "string" },
                          descripcion: { type: "string" },
                          precio_unitario: { type: "number" },
                          cantidad: { type: "integer" },
                          total_item: { type: "number" }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Factura creada con correlativo" },
            400: { description: "Datos inválidos" }
          }
        }
      },

      "/api/facturas/mi-historial": {
        get: {
          tags: ["Facturas"],
          summary: "Historial de facturas del cliente autenticado",
          description: "Retorna todas las facturas del usuario logueado con sus detalles.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Historial del cliente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      total: { type: "integer" },
                      facturas: { type: "array", items: { "$ref": "#/components/schemas/Factura" } }
                    }
                  }
                }
              }
            }
          }
        }
      },

      "/api/facturas/{id}": {
        get: {
          tags: ["Facturas"],
          summary: "Obtener factura por ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: {
              description: "Factura con detalles",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      factura: { "$ref": "#/components/schemas/Factura" }
                    }
                  }
                }
              }
            },
            404: { description: "Factura no encontrada" }
          }
        }
      },

      "/api/facturas/{id}/anular": {
        patch: {
          tags: ["Facturas"],
          summary: "Anular factura / boleta",
          description: "Solo admin/super. Cambia estado a 'Anulado'.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: { description: "Comprobante anulado" },
            400: { description: "Ya está anulado" },
            404: { description: "No encontrada" }
          }
        }
      },

      // ── Tablas Maestras ─────────────────────────────
      "/api/tablas-maestras/{tabla}": {
        get: {
          tags: ["Tablas Maestras"],
          summary: "Obtener valores por nombre de tabla",
          description: "Endpoint público. Retorna todos los registros activos de una tabla maestra.",
          parameters: [
            { name: "tabla", in: "path", required: true, schema: { type: "string" }, description: "Nombre de la tabla (TipoDocumento, forpago, tipoComprobante, ultdoc)" }
          ],
          responses: {
            200: {
              description: "Lista de valores",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      total: { type: "integer" },
                      registros: { type: "array", items: { "$ref": "#/components/schemas/TablaMaestra" } }
                    }
                  }
                }
              }
            }
          }
        }
      },

      "/api/tablas-maestras": {
        get: {
          tags: ["Tablas Maestras"],
          summary: "Listar todas las tablas maestras (admin)",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Lista completa" }
          }
        },
        post: {
          tags: ["Tablas Maestras"],
          summary: "Crear registro en tabla maestra",
          description: "Solo admin/super.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["tabla", "clave", "valor"],
                  properties: {
                    tabla: { type: "string", example: "forpago" },
                    clave: { type: "string", example: "YAPE" },
                    valor: { type: "string", example: "Yape" },
                    orden: { type: "integer", example: 1 }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Registro creado" },
            400: { description: "Clave duplicada" }
          }
        }
      },

      "/api/tablas-maestras/{id}": {
        put: {
          tags: ["Tablas Maestras"],
          summary: "Actualizar registro de tabla maestra",
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
                    valor: { type: "string" },
                    orden: { type: "integer" },
                    activo: { type: "boolean" }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: "Registro actualizado" },
            404: { description: "No encontrado" }
          }
        },
        delete: {
          tags: ["Tablas Maestras"],
          summary: "Eliminar registro de tabla maestra",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
          ],
          responses: {
            200: { description: "Registro eliminado" },
            404: { description: "No encontrado" }
          }
        }
      },

      // ── Ubigeo ─────────────────────────────────────
      "/api/ubigeos/departamentos": {
        get: {
          tags: ["Ubigeo"],
          summary: "Listar departamentos del Perú",
          description: "Retorna lista de departamentos con código y nombre.",
          responses: {
            200: {
              description: "Lista de departamentos",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      departamentos: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            code: { type: "string", example: "15" },
                            name: { type: "string", example: "Lima" }
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

      "/api/ubigeos/provincias/{codigo}": {
        get: {
          tags: ["Ubigeo"],
          summary: "Listar provincias de un departamento",
          description: "Parámetro: código de departamento (2 dígitos).",
          parameters: [
            { name: "codigo", in: "path", required: true, schema: { type: "string" }, description: "Código de departamento (ej: 15)", example: "15" }
          ],
          responses: {
            200: {
              description: "Lista de provincias",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      provincias: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            code: { type: "string", example: "01" },
                            name: { type: "string", example: "Lima" }
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

      "/api/ubigeos/distritos/{codigo}": {
        get: {
          tags: ["Ubigeo"],
          summary: "Listar distritos de una provincia",
          description: "Parámetro: código de provincia (4 dígitos).",
          parameters: [
            { name: "codigo", in: "path", required: true, schema: { type: "string" }, description: "Código de provincia (ej: 1501)", example: "1501" }
          ],
          responses: {
            200: {
              description: "Lista de distritos",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      distritos: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            code: { type: "string", example: "01" },
                            name: { type: "string", example: "Cercado de Lima" }
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

      "/api/ubigeos/validate/{codigo}": {
        get: {
          tags: ["Ubigeo"],
          summary: "Validar código ubigeo completo",
          description: "Parámetro: código de 6 dígitos. Retorna departamento, provincia y distrito.",
          parameters: [
            { name: "codigo", in: "path", required: true, schema: { type: "string" }, description: "Código ubigeo de 6 dígitos (ej: 150101)", example: "150101" }
          ],
          responses: {
            200: {
              description: "Ubigeo válido",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      valid: { type: "boolean", example: true },
                      departamento: { type: "string", example: "Lima" },
                      provincia: { type: "string", example: "Lima" },
                      distrito: { type: "string", example: "Cercado de Lima" }
                    }
                  }
                }
              }
            },
            400: { description: "Código inválido" }
          }
        }
      }
    }
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
