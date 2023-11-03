import { useEffect , useState ,useRef } from "react";
import Draggable from "../../Components/DraggableCanvas2"
import { useSearchParams } from "react-router-dom"
import Timeline from "../../Components/Timeline";
import { getRandomYearItem , getRandomColor } from "../../Js/utils";
import WhatYearScore from "./score";

const WhatYearQuiz = props => {

    const [ searchParams ]= useSearchParams();
    const [ quizArr, setQuizArr ] = useState();
    const [ yearRange, setYearRange ] = useState()

    const [zoom, setZoom] = useState(2);
    const [score, setScore] = useState();

    const headerRef = useRef();


    const TimeScale = <input type="range" id='zoom-slider' min="0.1" max="5" value={zoom} onChange={e=>{setZoom(e.target.value)}} step=".001"/>

    useEffect(()=>{
        getQuiz();
    },[searchParams])
    


    const getQuiz = ()=>{

        var topics = searchParams.get('topics').split(',').map( t=> t.trim().toLowerCase()) 
        var count = parseInt(searchParams.get('count')) || 4 
 
        var arr = props.jsonDatas.units['year'].filter(item=> {
           return  item.topic.some(word => topics.includes(word.trim().toLowerCase()))
        }).map(item => ({...item, year: item.value})) 
        arr = getRandomYearItem(arr, count);
        var sortedArr = arr.sort((a, b) => a.year - b.year )
       const startCentury  = Math.floor((sortedArr[0].year-50)/100) ;
       console.log( sortedArr[0].year , startCentury)
       const endCentry = Math.floor((sortedArr[arr.length -1].year+60)/100 );
       const _yearRange = { start: startCentury * 100 , end: endCentry *100 } 
       setYearRange( _yearRange )

        arr = arr.map( item=>({...item,
            color: getRandomColor(), 
            yearAnswered:Math.max(startCentury*100,Math.min( endCentry*100,startCentury*100 + Math.floor( Math.random() * (endCentry- startCentury) * 100 )))
        }))
        console.log( arr )
       setQuizArr(arr);

       const centuryCount = (endCentry-startCentury);

       var headerHeight = headerRef.current.getBoundingClientRect().height

       const _zoom = (window.innerHeight - headerHeight )/centuryCount *.01;
        setZoom(_zoom);
        setScore(false);
    }



    const onItemMoved = (pos , index )=>{
        //todo : update with zoom
        setQuizArr( prevArr =>{
          var arr = [...prevArr]; 
          arr[index].yearAnswered = Math.floor(pos.y) ;
          return arr
        })
    }




return (<>
<h1 ref={headerRef}>What Year?</h1>
{ !quizArr ? null :
    <div id='what-year-page' className="content-body">
    <Timeline yearRange={yearRange} zoom={zoom} >
            <div className='quizes'>
        {
    quizArr.map( ( item, index ) =><div  key={index}>
        <Draggable zoom = {zoom}
                style={{backgroundColor: item.color}}
                offset = { {x: 0 , y : yearRange.start }}
                pos ={ { x : 0 , y: (item.yearAnswered) }}
                onMoved={ pos => {onItemMoved(pos, index)} }
                className = {`historic-event ${item.distance > 10 ? 'failed' : ''} ${index%2 == 0 ? 'left' : 'right'}`}
        >
                                        {item.image? <img src={item.image} /> : null }

            <label>
                {item.summary}</label>
        </Draggable>

    {
        !score? null :<div className="range-container">
        <span key={item.summary} className="correction-range-bar" style={ {
            top: `${ (item.year - yearRange.start)*zoom}px`,
            height: `${25 * zoom}px`,
            left: `${index*100/quizArr.length}px`,
            width:100/quizArr.length+'px'}}
            >
            {
                Array.from({length:5},(_,int)=>(<span style={{backgroundColor: item.color}} />))
            }
        </span>
    </div>
    }



            </div>
            )
        }

            </div>
        </Timeline>
        {score ? <WhatYearScore quizArr={quizArr} onPlayAgain={()=>{getQuiz()}}/> :
        <button className='shadow big fixed bottom right' onClick={()=>{setScore(true)}} >Get Score</button> }

        </div>
      }
    {TimeScale} 
    </>
    
)



}

export default WhatYearQuiz
