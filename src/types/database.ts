export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      alianzas: {
        Row: {
          creado_en: string | null
          descripcion: string | null
          etiqueta: string
          id: string
          legacy_id: number | null
          logo_url: string | null
          nombre: string
          sitio_web: string | null
        }
        Insert: {
          creado_en?: string | null
          descripcion?: string | null
          etiqueta: string
          id?: string
          legacy_id?: number | null
          logo_url?: string | null
          nombre: string
          sitio_web?: string | null
        }
        Update: {
          creado_en?: string | null
          descripcion?: string | null
          etiqueta?: string
          id?: string
          legacy_id?: number | null
          logo_url?: string | null
          nombre?: string
          sitio_web?: string | null
        }
        Relationships: []
      }
      baneos: {
        Row: {
          admin_id: string | null
          creado_en: string | null
          fin: string
          id: string
          inicio: string | null
          motivo: string | null
          perfil_id: string
        }
        Insert: {
          admin_id?: string | null
          creado_en?: string | null
          fin: string
          id?: string
          inicio?: string | null
          motivo?: string | null
          perfil_id: string
        }
        Update: {
          admin_id?: string | null
          creado_en?: string | null
          fin?: string
          id?: string
          inicio?: string | null
          motivo?: string | null
          perfil_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "baneos_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baneos_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      batallas: {
        Row: {
          atacante_id: string | null
          defensor_id: string | null
          detalle_log: Json | null
          fecha: string | null
          id: string
          legacy_id: number | null
          puntos_ganados_atacante: number | null
          puntos_ganados_defensor: number | null
          recursos_robados: Json | null
          resultado: string | null
        }
        Insert: {
          atacante_id?: string | null
          defensor_id?: string | null
          detalle_log?: Json | null
          fecha?: string | null
          id?: string
          legacy_id?: number | null
          puntos_ganados_atacante?: number | null
          puntos_ganados_defensor?: number | null
          recursos_robados?: Json | null
          resultado?: string | null
        }
        Update: {
          atacante_id?: string | null
          defensor_id?: string | null
          detalle_log?: Json | null
          fecha?: string | null
          id?: string
          legacy_id?: number | null
          puntos_ganados_atacante?: number | null
          puntos_ganados_defensor?: number | null
          recursos_robados?: Json | null
          resultado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batallas_atacante_id_fkey"
            columns: ["atacante_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batallas_defensor_id_fkey"
            columns: ["defensor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat: {
        Row: {
          destinatario_id: string | null
          enviado_en: string | null
          id: string
          mensaje: string
          remitente_id: string | null
        }
        Insert: {
          destinatario_id?: string | null
          enviado_en?: string | null
          id?: string
          mensaje: string
          remitente_id?: string | null
        }
        Update: {
          destinatario_id?: string | null
          enviado_en?: string | null
          id?: string
          mensaje?: string
          remitente_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_remitente_id_fkey"
            columns: ["remitente_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cola_construccion: {
        Row: {
          creado_en: string | null
          edificio_id: string | null
          fin: string
          id: string
          inicio: string | null
          nivel_destino: number
          propiedad_id: string | null
        }
        Insert: {
          creado_en?: string | null
          edificio_id?: string | null
          fin: string
          id?: string
          inicio?: string | null
          nivel_destino: number
          propiedad_id?: string | null
        }
        Update: {
          creado_en?: string | null
          edificio_id?: string | null
          fin?: string
          id?: string
          inicio?: string | null
          nivel_destino?: number
          propiedad_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cola_construccion_edificio_id_fkey"
            columns: ["edificio_id"]
            isOneToOne: false
            referencedRelation: "configuracion_edificios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cola_construccion_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      cola_investigacion: {
        Row: {
          creado_en: string | null
          fin: string
          id: string
          inicio: string | null
          investigacion_id: string | null
          nivel_destino: number
          perfil_id: string | null
          propiedad_id: string | null
        }
        Insert: {
          creado_en?: string | null
          fin: string
          id?: string
          inicio?: string | null
          investigacion_id?: string | null
          nivel_destino: number
          perfil_id?: string | null
          propiedad_id?: string | null
        }
        Update: {
          creado_en?: string | null
          fin?: string
          id?: string
          inicio?: string | null
          investigacion_id?: string | null
          nivel_destino?: number
          perfil_id?: string | null
          propiedad_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cola_investigacion_investigacion_id_fkey"
            columns: ["investigacion_id"]
            isOneToOne: false
            referencedRelation: "configuracion_investigaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cola_investigacion_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cola_investigacion_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      cola_reclutamiento: {
        Row: {
          cantidad: number
          creado_en: string | null
          fin: string
          id: string
          inicio: string | null
          propiedad_id: string | null
          tropa_id: string | null
        }
        Insert: {
          cantidad: number
          creado_en?: string | null
          fin: string
          id?: string
          inicio?: string | null
          propiedad_id?: string | null
          tropa_id?: string | null
        }
        Update: {
          cantidad?: number
          creado_en?: string | null
          fin?: string
          id?: string
          inicio?: string | null
          propiedad_id?: string | null
          tropa_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cola_reclutamiento_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cola_reclutamiento_tropa_id_fkey"
            columns: ["tropa_id"]
            isOneToOne: false
            referencedRelation: "configuracion_tropas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion_edificios: {
        Row: {
          costo_armas: number
          costo_dolares: number
          costo_municion: number
          creado_en: string | null
          descripcion: string | null
          duracion_base: number
          id: string
          nombre: string
          produccion_base: number
          puntos: number
        }
        Insert: {
          costo_armas?: number
          costo_dolares?: number
          costo_municion?: number
          creado_en?: string | null
          descripcion?: string | null
          duracion_base?: number
          id: string
          nombre: string
          produccion_base?: number
          puntos?: number
        }
        Update: {
          costo_armas?: number
          costo_dolares?: number
          costo_municion?: number
          creado_en?: string | null
          descripcion?: string | null
          duracion_base?: number
          id?: string
          nombre?: string
          produccion_base?: number
          puntos?: number
        }
        Relationships: []
      }
      configuracion_investigaciones: {
        Row: {
          costo_armas: number
          costo_dolares: number
          costo_municion: number
          creado_en: string | null
          descripcion: string | null
          duracion_base: number
          id: string
          nombre: string
          puntos: number
        }
        Insert: {
          costo_armas?: number
          costo_dolares?: number
          costo_municion?: number
          creado_en?: string | null
          descripcion?: string | null
          duracion_base?: number
          id: string
          nombre: string
          puntos?: number
        }
        Update: {
          costo_armas?: number
          costo_dolares?: number
          costo_municion?: number
          creado_en?: string | null
          descripcion?: string | null
          duracion_base?: number
          id?: string
          nombre?: string
          puntos?: number
        }
        Relationships: []
      }
      configuracion_tropas: {
        Row: {
          ataque: number
          capacidad: number
          costo_armas: number
          costo_dolares: number
          costo_municion: number
          creado_en: string | null
          defensa: number
          descripcion: string | null
          duracion_base: number
          id: string
          nombre: string
          puntos: number
          salario: number
          tipo: string | null
          velocidad: number
        }
        Insert: {
          ataque?: number
          capacidad?: number
          costo_armas?: number
          costo_dolares?: number
          costo_municion?: number
          creado_en?: string | null
          defensa?: number
          descripcion?: string | null
          duracion_base?: number
          id: string
          nombre: string
          puntos?: number
          salario?: number
          tipo?: string | null
          velocidad?: number
        }
        Update: {
          ataque?: number
          capacidad?: number
          costo_armas?: number
          costo_dolares?: number
          costo_municion?: number
          creado_en?: string | null
          defensa?: number
          descripcion?: string | null
          duracion_base?: number
          id?: string
          nombre?: string
          puntos?: number
          salario?: number
          tipo?: string | null
          velocidad?: number
        }
        Relationships: []
      }
      edificios: {
        Row: {
          creado_en: string | null
          edificio_id: string | null
          id: string
          nivel: number
          propiedad_id: string | null
        }
        Insert: {
          creado_en?: string | null
          edificio_id?: string | null
          id?: string
          nivel?: number
          propiedad_id?: string | null
        }
        Update: {
          creado_en?: string | null
          edificio_id?: string | null
          id?: string
          nivel?: number
          propiedad_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edificios_edificio_id_fkey"
            columns: ["edificio_id"]
            isOneToOne: false
            referencedRelation: "configuracion_edificios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edificios_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      guerras: {
        Row: {
          alianza1_id: string | null
          alianza2_id: string | null
          creado_en: string | null
          declaracion: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          ganador_id: string | null
          id: string
          puntos_perdidos_alianza1: number | null
          puntos_perdidos_alianza2: number | null
        }
        Insert: {
          alianza1_id?: string | null
          alianza2_id?: string | null
          creado_en?: string | null
          declaracion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          ganador_id?: string | null
          id?: string
          puntos_perdidos_alianza1?: number | null
          puntos_perdidos_alianza2?: number | null
        }
        Update: {
          alianza1_id?: string | null
          alianza2_id?: string | null
          creado_en?: string | null
          declaracion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          ganador_id?: string | null
          id?: string
          puntos_perdidos_alianza1?: number | null
          puntos_perdidos_alianza2?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guerras_alianza1_id_fkey"
            columns: ["alianza1_id"]
            isOneToOne: false
            referencedRelation: "alianzas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guerras_alianza2_id_fkey"
            columns: ["alianza2_id"]
            isOneToOne: false
            referencedRelation: "alianzas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guerras_ganador_id_fkey"
            columns: ["ganador_id"]
            isOneToOne: false
            referencedRelation: "alianzas"
            referencedColumns: ["id"]
          },
        ]
      }
      investigaciones: {
        Row: {
          creado_en: string | null
          id: string
          investigacion_id: string | null
          nivel: number
          perfil_id: string | null
        }
        Insert: {
          creado_en?: string | null
          id?: string
          investigacion_id?: string | null
          nivel?: number
          perfil_id?: string | null
        }
        Update: {
          creado_en?: string | null
          id?: string
          investigacion_id?: string | null
          nivel?: number
          perfil_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investigaciones_investigacion_id_fkey"
            columns: ["investigacion_id"]
            isOneToOne: false
            referencedRelation: "configuracion_investigaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investigaciones_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mensajes: {
        Row: {
          asunto: string | null
          borrado_destinatario: boolean | null
          borrado_remitente: boolean | null
          creado_en: string | null
          cuerpo: string | null
          destinatario_id: string | null
          id: string
          leido: boolean | null
          remitente_id: string | null
        }
        Insert: {
          asunto?: string | null
          borrado_destinatario?: boolean | null
          borrado_remitente?: boolean | null
          creado_en?: string | null
          cuerpo?: string | null
          destinatario_id?: string | null
          id?: string
          leido?: boolean | null
          remitente_id?: string | null
        }
        Update: {
          asunto?: string | null
          borrado_destinatario?: boolean | null
          borrado_remitente?: boolean | null
          creado_en?: string | null
          cuerpo?: string | null
          destinatario_id?: string | null
          id?: string
          leido?: boolean | null
          remitente_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensajes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensajes_remitente_id_fkey"
            columns: ["remitente_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      miembros_alianza: {
        Row: {
          alianza_id: string | null
          id: string
          perfil_id: string | null
          rango: string | null
          unido_en: string | null
        }
        Insert: {
          alianza_id?: string | null
          id?: string
          perfil_id?: string | null
          rango?: string | null
          unido_en?: string | null
        }
        Update: {
          alianza_id?: string | null
          id?: string
          perfil_id?: string | null
          rango?: string | null
          unido_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "miembros_alianza_alianza_id_fkey"
            columns: ["alianza_id"]
            isOneToOne: false
            referencedRelation: "alianzas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miembros_alianza_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: true
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_mapa: {
        Row: {
          creado_en: string | null
          destino_x: number
          destino_y: number
          destino_z: number
          id: string
          llegada: string
          perfil_id: string | null
          propiedad_origen_id: string | null
          recursos: Json | null
          regreso: string | null
          salida: string | null
          tipo_mision: string
          tropas: Json
        }
        Insert: {
          creado_en?: string | null
          destino_x: number
          destino_y: number
          destino_z: number
          id?: string
          llegada: string
          perfil_id?: string | null
          propiedad_origen_id?: string | null
          recursos?: Json | null
          regreso?: string | null
          salida?: string | null
          tipo_mision: string
          tropas?: Json
        }
        Update: {
          creado_en?: string | null
          destino_x?: number
          destino_y?: number
          destino_z?: number
          id?: string
          llegada?: string
          perfil_id?: string | null
          propiedad_origen_id?: string | null
          recursos?: Json | null
          regreso?: string | null
          salida?: string | null
          tipo_mision?: string
          tropas?: Json
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_mapa_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_mapa_propiedad_origen_id_fkey"
            columns: ["propiedad_origen_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      ofertas_mercado: {
        Row: {
          aceptada: boolean | null
          cantidad: number
          comprador_id: string | null
          creado_en: string | null
          expira_en: string | null
          id: string
          pide_armas: number | null
          pide_dolares: number | null
          pide_municion: number | null
          recurso: string
          vendedor_id: string | null
        }
        Insert: {
          aceptada?: boolean | null
          cantidad: number
          comprador_id?: string | null
          creado_en?: string | null
          expira_en?: string | null
          id?: string
          pide_armas?: number | null
          pide_dolares?: number | null
          pide_municion?: number | null
          recurso: string
          vendedor_id?: string | null
        }
        Update: {
          aceptada?: boolean | null
          cantidad?: number
          comprador_id?: string | null
          creado_en?: string | null
          expira_en?: string | null
          id?: string
          pide_armas?: number | null
          pide_dolares?: number | null
          pide_municion?: number | null
          recurso?: string
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ofertas_mercado_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ofertas_mercado_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          actualizado_en: string | null
          creado_en: string | null
          email: string | null
          esta_baneado: boolean | null
          fin_baneo: string | null
          id: string
          idioma: string | null
          legacy_id: number | null
          nombre_usuario: string
          posicion_ranking: number | null
          puntos_edificios: number | null
          puntos_investigaciones: number | null
          puntos_total: number | null
          puntos_tropas: number | null
          ultimo_activo: string | null
          vacaciones: boolean | null
        }
        Insert: {
          actualizado_en?: string | null
          creado_en?: string | null
          email?: string | null
          esta_baneado?: boolean | null
          fin_baneo?: string | null
          id: string
          idioma?: string | null
          legacy_id?: number | null
          nombre_usuario: string
          posicion_ranking?: number | null
          puntos_edificios?: number | null
          puntos_investigaciones?: number | null
          puntos_total?: number | null
          puntos_tropas?: number | null
          ultimo_activo?: string | null
          vacaciones?: boolean | null
        }
        Update: {
          actualizado_en?: string | null
          creado_en?: string | null
          email?: string | null
          esta_baneado?: boolean | null
          fin_baneo?: string | null
          id?: string
          idioma?: string | null
          legacy_id?: number | null
          nombre_usuario?: string
          posicion_ranking?: number | null
          puntos_edificios?: number | null
          puntos_investigaciones?: number | null
          puntos_total?: number | null
          puntos_tropas?: number | null
          ultimo_activo?: string | null
          vacaciones?: boolean | null
        }
        Relationships: []
      }
      premium_transacciones: {
        Row: {
          codigo: string | null
          fecha: string | null
          id: string
          perfil_id: string | null
          producto_id: number | null
          transaccion_id: string
        }
        Insert: {
          codigo?: string | null
          fecha?: string | null
          id?: string
          perfil_id?: string | null
          producto_id?: number | null
          transaccion_id: string
        }
        Update: {
          codigo?: string | null
          fecha?: string | null
          id?: string
          perfil_id?: string | null
          producto_id?: number | null
          transaccion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_transacciones_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      propiedades: {
        Row: {
          coord_x: number
          coord_y: number
          coord_z: number
          creado_en: string | null
          id: string
          legacy_id: number | null
          nombre: string | null
          perfil_id: string | null
          puntos: number | null
          recursos_alcohol: number | null
          recursos_armas: number | null
          recursos_dolares: number | null
          recursos_municion: number | null
          ultima_actualizacion: string | null
        }
        Insert: {
          coord_x: number
          coord_y: number
          coord_z: number
          creado_en?: string | null
          id?: string
          legacy_id?: number | null
          nombre?: string | null
          perfil_id?: string | null
          puntos?: number | null
          recursos_alcohol?: number | null
          recursos_armas?: number | null
          recursos_dolares?: number | null
          recursos_municion?: number | null
          ultima_actualizacion?: string | null
        }
        Update: {
          coord_x?: number
          coord_y?: number
          coord_z?: number
          creado_en?: string | null
          id?: string
          legacy_id?: number | null
          nombre?: string | null
          perfil_id?: string | null
          puntos?: number | null
          recursos_alcohol?: number | null
          recursos_armas?: number | null
          recursos_dolares?: number | null
          recursos_municion?: number | null
          ultima_actualizacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propiedades_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rendiciones_guerra: {
        Row: {
          alianza_id: string | null
          fecha: string | null
          guerra_id: string | null
          id: string
          mensaje: string | null
        }
        Insert: {
          alianza_id?: string | null
          fecha?: string | null
          guerra_id?: string | null
          id?: string
          mensaje?: string | null
        }
        Update: {
          alianza_id?: string | null
          fecha?: string | null
          guerra_id?: string | null
          id?: string
          mensaje?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rendiciones_guerra_alianza_id_fkey"
            columns: ["alianza_id"]
            isOneToOne: false
            referencedRelation: "alianzas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rendiciones_guerra_guerra_id_fkey"
            columns: ["guerra_id"]
            isOneToOne: false
            referencedRelation: "guerras"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitudes_alianza: {
        Row: {
          alianza_id: string | null
          fecha: string | null
          id: string
          mensaje: string | null
          perfil_id: string | null
        }
        Insert: {
          alianza_id?: string | null
          fecha?: string | null
          id?: string
          mensaje?: string | null
          perfil_id?: string | null
        }
        Update: {
          alianza_id?: string | null
          fecha?: string | null
          id?: string
          mensaje?: string | null
          perfil_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_alianza_alianza_id_fkey"
            columns: ["alianza_id"]
            isOneToOne: false
            referencedRelation: "alianzas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitudes_alianza_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tropas: {
        Row: {
          cantidad: number
          creado_en: string | null
          id: string
          propiedad_id: string | null
          tropa_id: string | null
        }
        Insert: {
          cantidad?: number
          creado_en?: string | null
          id?: string
          propiedad_id?: string | null
          tropa_id?: string | null
        }
        Update: {
          cantidad?: number
          creado_en?: string | null
          id?: string
          propiedad_id?: string | null
          tropa_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tropas_propiedad_id_fkey"
            columns: ["propiedad_id"]
            isOneToOne: false
            referencedRelation: "propiedades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tropas_tropa_id_fkey"
            columns: ["tropa_id"]
            isOneToOne: false
            referencedRelation: "configuracion_tropas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      inicializar_propiedad: {
        Args: { p_nombre_propiedad?: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
