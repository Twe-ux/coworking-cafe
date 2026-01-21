import 'jsvectormap'
// import 'jsvectormap/dist/maps/world.js' // Map not available, using world as fallback

//components
import BaseVectorMap from './BaseVectorMap'

interface SpainVectorMapProps {
  width?: string
  height?: string
  options?: any
}

const SpainVectorMap = ({ width, height, options }: SpainVectorMapProps) => {
  return (
    <>
      <BaseVectorMap width={width} height={height} options={options} type="spain" />
    </>
  )
}

export default SpainVectorMap
