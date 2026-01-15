# 📋 Componentes de Fechas de Vencimiento por Etapa

Esta documentación describe los componentes y hooks implementados para la funcionalidad de "Fechas de Vencimiento por Etapa" del sistema de reclutamiento.

## 📁 **Archivos Implementados**

### 🆕 **Componentes Principales**

1. **`StageDateSelector.tsx`** - Componente para seleccionar y modificar fechas individuales
2. **`StageProgress.tsx`** - Componente visual para mostrar progreso de etapas
3. **`RecruitmentStagesWithDates.tsx`** - Componente principal con todas las funcionalidades de fechas

### 🎣 **Componentes Utilitarios**

1. **`StageTimelineView.tsx`** - Vista de línea de tiempo para las etapas (bonus)

---

## 📖 **Hook Principal**

### `useStageDueDates.ts`

Hook principal que gestiona todo el estado y operaciones relacionadas con fechas de vencimiento.

---

## 🚀 **Uso Básico**

### 📝 **Importación y Configuración**

```typescript
import { useStageDueDates } from '../hooks/useStageDueDates';

const ComponenteRecruitment = ({ recruitmentId }) => {
  const {
    dueDates,
    loading,
    createDueDate,
    updateDueDate,
    deleteDueDate,
    markAsCompleted,
    getByStage,
    getOverdue,
    getUpcomingAlerts,
    calculateDaysOverdue
  } = useStageDueDates({
    recruitmentId,
    autoRefresh: true,
    refreshInterval: 30000
  });

  // Mostrar fechas de vencimiento
  return (
    <RecruitmentStagesWithDates
      stages={dueDates}
      onStageDateChange={(stageName, dueDate) => {
        // La integración con el backend se hace automáticamente
        console.log(`Stage date updated for ${stageName}:`, dueDate);
      }}
      title="Fechas de Vencimiento por Etapa"
      disabled={loading}
    />
  );
};
```

---

## 🔧 **Configuración de Componentes**

### `useStageDueDates` Options

```typescript
interface UseStageDueDatesOptions {
  recruitmentId: string;           // ID del proceso de reclutamiento
  autoRefresh?: boolean;          // Auto-refresh cada 30 segundos por defecto
  refreshInterval?: number;      // Intervalo de refresh en ms
}
```

---

## 📊 **Características Principales**

### 🔧 **Operaciones CRUD Completas**
- ✅ **Crear fechas**: `createDueDate()`
- ✅ **Actualizar fechas**: `updateDueDate()`
- ✅ **Eliminar fechas**: `deleteDueDate()`
- ✅ **Marcar como completada**: `markAsCompleted()`

### 📈 **Métodos de Consulta y Filtros**
- ✅ **Obener todas**: `getStageDueDates()` con paginación y filtros
- ✅ **Por etapa**: `getByStage()`
- ✅ **Fechas vencidas**: `getOverdue()`
- ✅ **Alertas próximas**: `getUpcomingAlerts()`

### 📊 **Análisis y Estadísticas**
- ✅ **Cálculo de días**: `calculateDaysOverdue()`
- ✅ **Estado general**: `getOverallStatus()`
- ✅ **Resúmenes**: `getSummary()`

### 🎯 **Seguridad y Permisos**
- ✅ **Validación de roles**: Requiere `recruiter` o `recruiter-supervisor`
- ✅ **Validación autenticación**: Verificación automática de tokens
- ✅ **Manejo de errores**: Con notificaciones toast específicas

### 🔄 **Auto-refresh**
- ✅ **Configurable**: Intervalo ajustable en segundos
- ✅ **Integración**: Se activa solo cuando se proporciona el `recruitmentId`

---

## 🎨 **Tipos de Datos**

### 📋 **Interfaces Principales**

```typescript
interface StageDueDate {
  id: string;
  stage: StageEnum;                    // Etapa del proceso
  dueDate: string;                    // Fecha límite (YYYY-MM-DD)
  alertDays?: number;                 // Días de anticipación para alerta
  isCompleted: boolean;                // Si la etapa está completada
  completedAt?: string;                // Fecha de finalización
  notes?: string;                     // Notas adicionales
  createdAt: string;                  // Fecha de creación
  updatedAt: string;                  // Fecha de última actualización
}

type StageEnum = 
  | 'applied'        // Aplicado
  | 'screening'     // Selección inicial
  | 'technical'    // Entrevista técnica
  | 'cultural'     // Entrevista cultural
  | 'offer'         // Oferta
  | 'hired';         // Contratado

interface StageDueDateListResponse {
  data: StageDueDate[];
  pagination: Pagination;
}

interface CreateStageDueDateRequest {
  stage: StageEnum;
  dueDate: string;
  alertDays?: number;
  notes?: string;
}

interface UpdateStageDueDateRequest {
  dueDate?: string;
  alertDays?: number;
  isCompleted?: boolean;
  notes?: string;
}

interface StageDueDateStats {
  total: number;
  completed: number;
  overdue: number;
  upcomingAlerts: number;
  completionRate: number;
}

interface StageDueDateSummary {
  stage: StageEnum;
  dueDate: string;
  isCompleted: boolean;
  daysOverdue?: number;
  daysUntilDue?: number;
  alertDays?: number;
  status: 'completed' | 'on-time' | 'overdue' | 'alert-due';
}
```

---

## 🎯 **Servicios**

### `stageDueDateService.ts`

Servicio principal que implementa todas las operaciones CRUD y análisis.

```typescript
// Métodos principales
class StageDueDateService {
  // CRUD completo
  async createStageDueDate(recruitmentId, request): Promise<StageDueDate>
  async getStageDueDates(recruitmentId, params?): Promise<StageDueDateListResponse>
  async getStageDueDate(recruitmentId, stageDueDateId): Promise<StageDueDate>
  async updateStageDueDate(recruitmentId, stageDueDateId, request): Promise<StageDueDate>
  async deleteStageDueDate(recruitmentId, stageDueDateId): Promise<void>
  
  // Métodos especializados
  async getOverdueStageDueDates(recruitmentId, params?): Promise<StageDueDateListResponse>
  async getUpcomingStageDueDateAlerts(recruitmentId, params?): Promise<StageDueDateListResponse>
  
  // Métodos de conveniencia
  async createForStage(recruitmentId, stage, dueDate, options?)
  async markAsCompleted(recruitmentId, stageDueDateId, notes?)
  async updateAlertConfig(recruitmentId, stageDueDateId, alertDays)
  async updateDueDate(recruitmentId, stageDueDateId, dueDate, notes?)
  async getByStage(recruitmentId, stage): Promise<StageDueDate[]>
  
  // Análisis
  async getStats(recruitmentId): Promise<StageDueDateStats>
  async getSummary(recruitmentId): Promise<StageDueDateSummary[]>
  async calculateDaysOverdue(dueDate: string): DaysOverdueCalculation
  
  // Operaciones en lote
  async bulkCreate(recruitmentId, requests): Promise<Array<{...}>>
  async bulkUpdate(recruitmentId, updates): Promise<Array<{...}>>
}
```

---

## 📝 **Guía de Implementación**

### 🚀 **Para Desarrolladores**

1. **Usar los tipos importados**: Siempre importar desde `../types/recruitmentProcess`
2. **Manejo de errores**: Todas las funciones asíncronas deben manejar errores con `try-catch` y usar las excepciones específicas del servicio
3. **Validación de permisos**: Antes de cada operación, verificar `validateAuth()` para asegurar que el usuario tiene los permisos requeridos
4. **Estados de carga**: Usar los estados `loading`, `error`, `isSubmitting` del hook para mostrar indicadores de carga

### 🚀 **Para Usuarios**

1. **Integración en componentes React**:
   ```typescript
   const { createDueDate, loading, error } = useStageDueDates({
     recruitmentId: 'process-123'
   });

   const handleSubmit = async (formData: CreateStageDueDateRequest) => {
     try {
       await createDueDate(formData.stage, formData.dueDate);
       toast.success('Fecha de vencimiento creada exitosamente');
     } catch (error) {
       console.error('Error creating due date:', error);
     }
   };
   ```

2. **Personalización del mensaje de error**:
   - Modificar los mensajes de error del servicio para que sean más descriptivos y útiles para los usuarios
   - Agregar contexto específico de negocio cuando sea necesario

### 🚀 **Mejores Prácticas**

1. **Optimización de Carga**:
   - Usar `memo` para cálculos que no cambian frecuentemente
   - Evitar recargas innecesarias con `autoRefresh` configurable
   - Implementar carga diferida para operaciones pesadas

2. **Manejo de Estado**:
   - Separar claramente los estados de carga (`loading`, `error`, `isSubmitting`)
   - No mostrar estados conflictivos simultáneamente
   - Transiciones suaves entre estados con componentes intermedios si es necesario

3. **Validación Progresiva**:
   - Validar datos de entrada antes de enviar al backend
   - Usar los tipos TypeScript para validación en tiempo de compilación
   - Proporcionar mensajes de error constructivos que ayuden al usuario a resolver el problema

---

## 📋 **Testing**

### 🧪 **Pruebas Unitarias Sugeridas**

```typescript
// Prueba del servicio
describe('StageDueDateService', () => {
  const mockService = {
    createStageDueDate: jest.fn().mockResolvedValue({ id: 'test-id', stage: 'screening', dueDate: '2025-01-15' }),
    getStageDueDates: jest.fn().mockResolvedValue({
      data: [
        { id: '1', stage: 'applied', dueDate: '2025-01-15', isCompleted: false },
        { id: '2', stage: 'screening', dueDate: '2025-01-20', isCompleted: true }
      ],
      pagination: { page: 1, limit: 20, total: 2 }
    }),
    updateStageDueDate: jest.fn().mockResolvedValue({ ... }),
    deleteStageDueDate: jest.fn().mockResolvedValue(undefined)
  };

  const service = new StageDueDateService();
  
  it('should create stage due date', async () => {
    const result = await service.createStageDueDate('process-123', {
      stage: 'applied',
      dueDate: '2025-01-15',
      alertDays: 3
    });
    
    expect(result).toEqual({
      id: 'test-id',
      stage: 'applied',
      dueDate: '2025-01-15',
      alertDays: 3,
      isCompleted: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    });
  });

  it('should handle validation error', async () => {
    // Simular error de validación
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const result = await service.createStageDueDate('invalid-process-id', {
      stage: 'invalid-stage',
      dueDate: '2025-01-15'
    });
    
    expect(result).reject.toThrow();
  });
});
```

---

## 🚀 **Consideraciones Técnicas**

1. **Concurrencia**: Para operaciones bulk, usar Promise.allSettled() para procesamiento en paralelo
2. **Caching**: Implementar caché local para consultas frecuentes (estadísticas, resúmenes)
3. **Batch Updates**: Agrupar múltiples actualizaciones en una sola llamada al backend
4. **Error Recovery**: Implementar reintentos automáticos con exponential backoff
5. **Memory Management**: Limpiar observadores y timeouts para evitar fugas de memoria

---

## 📋 **Deployment**

### 🔧 **Variables de Entorno**

```bash
# Producción
VITE_RECRUITMENT_API_URL=https://api.example.com/recruitmentapi/v1

# Desarrollo
VITE_RECRUITMENT_API_URL=http://localhost:8080/recruitmentapi/v1
```

### 🔐 **Configuración de Build**

```json
{
  "name": "geniarh-frontend-v2",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "lucide-react": "^0.263.1",
    "date-fns": "^2.30.0"
    "tailwindcss": "^3.0.0"
  },
  "build": {
    "outDir": "dist",
    "sourcemap": true,
    "rollupOptions": {
      "output": {
        "format": "esm"
      }
    }
  }
}
```

---

## 🎯 **Monitoreo y Logging**

### 📊 **Métricas Clave**

```typescript
interface StageDueDateMetrics {
  totalStages: number;
  completedStages: number;
  overdueStages: number;
  averageCompletionTime: number; // en días
  onTimePercentage: number;
}
```

---

## 🔒 **Troubleshooting Común**

### 🐛 **Errores Frecuentes y Soluciones**

| Error | Causa | Solución |
|-------|--------|----------|
| `403 Forbidden` | Permisos insuficientes | Verificar roles y contactar al administrador |
| `422 Unprocessable` | Datos inválidos | Validar datos de entrada contra el esquema |
| `500 Internal Server` | Error del servidor | Reintentar la operación más tarde |

### 🛠️ **Notas Importantes**

- La configuración de alertas (`alertDays`) se basa en **días naturales** (1-7)
- Las fechas de vencimiento son **independientes por etapa** y no afectan a otras etapas
- El servicio incluye **validaciones de negocio** para evitar fechas pasadas o duplicados

---

## 🔄 **Versionamiento y Mantenimiento**

### 📋 ** roadmap Sugerida**

#### v1.0 (Actual) ✅
- ✅ CRUD básico de fechas de vencimiento
- ✅ Análisis y monitoreo básico
- ✅ Integración con UI principal

#### v1.1 (Planeado) 📋
- ✅ Notificaciones por correo electrónico
- ✅ Reportes de vencimiento exportables
- ✅ Integración con sistema de calendar externo
- ✅ Análisis predictivo de tiempo de finalización

#### v1.2 (Futuro) 🚀
- ✅ Machine learning para optimización de fechas de vencimiento
- ✅ Flujo de aprobación automática de fechas
- ✅ Integración con herramientas de project management

---

## 📚 **Soporte y Mantenimiento**

Para soporte o reporte problemas relacionados con la funcionalidad de fechas de vencimiento:

1. **Documentación**: Esta guía y los comentarios en el código fuente
2. **Issues**: Utilizar el sistema de seguimiento de issues del proyecto
3. **Contacto**: Contactar al equipo de desarrollo para asistencia técnica

## 🎯 **Créditos**

- **Desarrolladores Principales**: Frontend Team
- **Arquitecto**: Sistema de componentes reutilizables con hooks especializados
- **Testing**: Equipo QA con experiencia en pruebas de integración

---

*Esta documentación está actualizada regularmente para reflejar cambios y mejoras continuas en la funcionalidad.*