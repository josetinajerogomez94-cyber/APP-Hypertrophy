import { z } from 'zod'

export const profileInputSchema = z.object({
  weightKg: z.number().min(30, 'El peso debe estar entre 30 y 300 kg').max(300, 'El peso debe estar entre 30 y 300 kg'),
  heightCm: z.number().min(100, 'La altura debe estar entre 100 y 250 cm').max(250, 'La altura debe estar entre 100 y 250 cm'),
  targetWeightKg: z.number().min(30, 'El peso objetivo debe estar entre 30 y 300 kg').max(300, 'El peso objetivo debe estar entre 30 y 300 kg'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de inicio no válida'),
  trainingDays: z.array(z.number().int().min(0).max(6)).min(1, 'Elige al menos un día').max(7)
})

export type ProfileInput = z.infer<typeof profileInputSchema>
