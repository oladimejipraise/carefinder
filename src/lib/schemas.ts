import { z } from 'zod'

export const HospitalFormSchema = z.object({
  name:           z.string().min(2, 'Name is required'),
  address:        z.string().min(5, 'Address is required'),
  city:           z.string().min(2, 'City is required'),
  lga:            z.string().min(2, 'LGA is required'),
  phone:          z.string().regex(
                    /^\+234[0-9]{10}$/,
                    'Enter a valid Nigerian phone number e.g. +2348012345678'
                  ),
  email:          z.string().email().optional().or(z.literal('')),
  specialties:    z.array(z.string()).min(1, 'Select at least one specialty'),
  ownership:      z.enum(['public', 'private']),
  description_md: z.string().optional(),
  visiting_hours: z.string().optional(),
  lat:            z.number().min(4).max(14),
  lng:            z.number().min(2).max(15),
})

export type HospitalFormValues = z.infer<typeof HospitalFormSchema>

export const ReviewFormSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text:   z.string().max(1000).optional(),
})

export type ReviewFormValues = z.infer<typeof ReviewFormSchema>

export const ShareEmailSchema = z.object({
  to:          z.string().email('Enter a valid email address'),
  hospitalIds: z.array(z.string()).min(1).max(20),
  senderName:  z.string().optional(),
})

export type ShareEmailValues = z.infer<typeof ShareEmailSchema>