import type { ComponentType, SVGProps } from 'react'
import {
  Accessibility,
  AccessibilitySign,
  AccessibilityTech,
  Activity,
  Archive,
  ArrowRight,
  Bell,
  Book,
  Box,
  Brain,
  Calendar,
  Camera,
  Check,
  Cloud,
  Code,
  Community,
  Compass,
  Cpu,
  CreditCard,
  Crown,
  Cube,
  CubeBandage,
  Cylinder,
  Dashboard,
  Database,
  DeliveryTruck,
  DesignNib,
  Dna,
  DocStar,
  Dollar,
  Download,
  Edit,
  Eye,
  Filter,
  Folder,
  GitBranch,
  Globe,
  GraphUp,
  GridPlus,
  Group,
  HardDrive,
  Headset,
  HealthShield,
  Healthcare,
  Heart,
  HeartArrowDown,
  HeartSolid,
  Home,
  HomeHospital,
  Hospital,
  HospitalCircle,
  HospitalCircleSolid,
  Key,
  Laptop,
  Lifebelt,
  Link,
  Lock,
  Mail,
  Map,
  MediaImage,
  Message,
  Microphone,
  Microscope,
  MicroscopeSolid,
  Network,
  Page,
  Palette,
  PharmacyCrossCircle,
  PharmacyCrossTag,
  Phone,
  Play,
  Puzzle,
  QrCode,
  Refresh,
  Rhombus,
  Rocket,
  Search,
  Server,
  Settings,
  Shield,
  Shop,
  Spark,
  Sparks,
  Square,
  Star,
  Terminal,
  TestTube,
  TestTubeSolid,
  Timer,
  Tools,
  Trash,
  Upload,
  User,
  Wallet,
  Wifi,
  Wrench,
  XrayView,
} from 'iconoir-react'

export type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { width?: number; height?: number }
>

export const iconoirCatalog = {
  Accessibility,
  AccessibilitySign,
  AccessibilityTech,
  Activity,
  Archive,
  ArrowRight,
  Bell,
  Book,
  Box,
  Brain,
  Calendar,
  Camera,
  Check,
  Cloud,
  Code,
  Community,
  Compass,
  Cpu,
  CreditCard,
  Crown,
  Cube,
  CubeBandage,
  Cylinder,
  Dashboard,
  Database,
  DeliveryTruck,
  DesignNib,
  Dna,
  DocStar,
  Dollar,
  Download,
  Edit,
  Eye,
  Filter,
  Folder,
  GitBranch,
  Globe,
  GraphUp,
  GridPlus,
  Group,
  HardDrive,
  Headset,
  HealthShield,
  Healthcare,
  Heart,
  HeartArrowDown,
  HeartSolid,
  Home,
  HomeHospital,
  Hospital,
  HospitalCircle,
  HospitalCircleSolid,
  Key,
  Laptop,
  Lifebelt,
  Link,
  Lock,
  Mail,
  Map,
  MediaImage,
  Message,
  Microphone,
  Microscope,
  MicroscopeSolid,
  Network,
  Page,
  Palette,
  PharmacyCrossCircle,
  PharmacyCrossTag,
  Phone,
  Play,
  Puzzle,
  QrCode,
  Refresh,
  Rhombus,
  Rocket,
  Search,
  Server,
  Settings,
  Shield,
  Shop,
  Spark,
  Sparks,
  Square,
  Star,
  Terminal,
  TestTube,
  TestTubeSolid,
  Timer,
  Tools,
  Trash,
  Upload,
  User,
  Wallet,
  Wifi,
  Wrench,
  XrayView,
} as const satisfies Record<string, IconComponent>

export type IconName = keyof typeof iconoirCatalog

export const iconNames = Object.keys(iconoirCatalog) as IconName[]

const legacyIconMap: Record<string, IconName> = {
  globe: 'Globe',
  gem: 'Rhombus',
  sparkles: 'Sparks',
  database: 'Database',
  cpu: 'Cpu',
  'file-text': 'Page',
}

const iconKeywords: Partial<Record<IconName, string[]>> = {
  Accessibility: ['health', 'medical', 'disability', 'wheelchair', 'accessibility'],
  AccessibilitySign: ['health', 'medical', 'disability', 'wheelchair', 'accessibility'],
  AccessibilityTech: ['health', 'medical', 'disability', 'assistive', 'accessibility'],
  Activity: ['health', 'medical', 'vitals', 'pulse', 'ecg', 'monitor', 'heart rate'],
  Brain: ['health', 'medical', 'neurology', 'mental', 'brain'],
  CubeBandage: ['health', 'medical', 'first aid', 'injury', 'wound', 'bandage'],
  Dna: ['health', 'medical', 'genetics', 'lab', 'biology'],
  HealthShield: ['health', 'medical', 'insurance', 'protection', 'coverage'],
  Healthcare: ['health', 'medical', 'medicine', 'care', 'clinic', 'doctor', 'hospital'],
  Heart: ['health', 'medical', 'cardiac', 'cardiology', 'heart'],
  HeartArrowDown: ['health', 'medical', 'cardiac', 'donate', 'heart'],
  HeartSolid: ['health', 'medical', 'cardiac', 'cardiology', 'heart'],
  HomeHospital: ['health', 'medical', 'hospital', 'home', 'care', 'nursing', 'patient'],
  Hospital: ['health', 'medical', 'hospital', 'clinic', 'emergency', 'doctor'],
  HospitalCircle: ['health', 'medical', 'hospital', 'clinic', 'emergency'],
  HospitalCircleSolid: ['health', 'medical', 'hospital', 'clinic', 'emergency'],
  Lifebelt: ['health', 'medical', 'emergency', 'rescue', 'safety', 'ambulance'],
  Microscope: ['health', 'medical', 'lab', 'laboratory', 'research', 'pathology'],
  MicroscopeSolid: ['health', 'medical', 'lab', 'laboratory', 'research', 'pathology'],
  PharmacyCrossCircle: ['health', 'medical', 'pharmacy', 'drug', 'medicine', 'rx', 'prescription'],
  PharmacyCrossTag: ['health', 'medical', 'pharmacy', 'drug', 'medicine', 'rx', 'prescription'],
  TestTube: ['health', 'medical', 'lab', 'laboratory', 'test', 'sample', 'blood'],
  TestTubeSolid: ['health', 'medical', 'lab', 'laboratory', 'test', 'sample', 'blood'],
  XrayView: ['health', 'medical', 'radiology', 'imaging', 'scan', 'xray', 'x-ray'],
}

export function normalizeIconName(name: string): IconName {
  if (name in iconoirCatalog) {
    return name as IconName
  }

  if (legacyIconMap[name]) {
    return legacyIconMap[name]
  }

  return 'Square'
}

export function getIcon(name: string): IconComponent {
  return iconoirCatalog[normalizeIconName(name)]
}

export function formatIconLabel(name: string): string {
  return normalizeIconName(name).replace(/([A-Z])/g, ' $1').trim()
}

export function searchIcons(query: string): IconName[] {
  const trimmed = query.trim().toLowerCase()

  if (!trimmed) {
    return iconNames
  }

  return iconNames.filter((name) => {
    const label = formatIconLabel(name).toLowerCase()
    const keywords = iconKeywords[name]?.join(' ') ?? ''
    const haystack = `${name.toLowerCase()} ${label} ${keywords}`
    return haystack.includes(trimmed)
  })
}
