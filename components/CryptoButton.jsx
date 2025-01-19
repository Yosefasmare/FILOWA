const CryptoButton = ({name,icon,bg,active,setCurrency}) => {


  return (
    <button
    onClick={()=>setCurrency(name)}
    className={`flex flex-col justify-center px-7 py-2  ${bg}  rounded-md transition ease-in-out scale-100 ${active}  hover:scale-105`}>
      <span className='px-3 py-2 flex justify-center items-center w-full'>{icon}</span>
      <p className='p-2 font-bold text-xl flex justify-center items-center'>{name}</p>
    </button>
  )
}

export default CryptoButton
