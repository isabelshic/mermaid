type GroupToolIconProps = {
  size?: number
  color?: string
}

export function GroupToolIcon({ size = 16, color = 'currentColor' }: GroupToolIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill={color}
        d="M112 476h72v72h-72zm182 0h72v72h-72zm364 0h72v72h-72zm182 0h72v72h-72zm-364 0h72v72h-72z"
      />
    </svg>
  )
}
