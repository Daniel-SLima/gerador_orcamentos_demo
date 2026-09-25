import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OrçaDemo | Sistema de Orçamentos',
    short_name: 'OrçaDemo',
    description: 'Ambiente demonstrativo com dados totalmente fictícios.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
  }
}
