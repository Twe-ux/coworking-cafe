import 'jsvectormap'
// import 'jsvectormap/dist/maps/world.js' // Map not available, using world as fallback

//components
import BaseVectorMap from './BaseVectorMap'

interface CanadaVectorMapProps {
  width?: string
  height?: string
  options?: any
}

const CanadaVectorMap = ({ width, height, options }: CanadaVectorMapProps) => {
  return (
    <>
      <BaseVectorMap width={width} height={height} options={options} type="canada" />
    </>
  )
}

export default CanadaVectorMap
