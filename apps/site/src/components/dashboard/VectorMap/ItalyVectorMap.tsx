import 'jsvectormap'
// import 'jsvectormap/dist/maps/world.js' // Map not available, using world as fallback

//components
import BaseVectorMap from './BaseVectorMap'

interface ItalyVectorMapProps {
  width?: string
  height?: string
  options?: any
}

const ItalyVectorMap = ({ width, height, options }: ItalyVectorMapProps) => {
  return (
    <>
      <BaseVectorMap width={width} height={height} options={options} type="italy" />
    </>
  )
}

export default ItalyVectorMap
