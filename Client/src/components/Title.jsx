const Title = ({ title, subTitle }) => {
  return (
    <div className='text-center'>
      <h2 className='text-3xl md:text-4xl font-semibold'>
        {title}
      </h2>

      <p className='text-gray-500 mt-2 max-w-xl mx-auto'>
        {subTitle}
      </p>
    </div>
  )
}

export default Title
