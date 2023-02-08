import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Amplify, API, graphqlOperation } from "aws-amplify";
import getConfig from "next/config";
import { GAME_ACTION, GAME_SUBSCRIPTION } from "@queries/games/sciptsGames";
import { GET_ACTIVITY_BY_ID } from "@queries/scriptsActivities";
import { GET_TIC_TIC_TOE_BY_ACTIVITYID } from "@queries/tools/scriptsTicTacToe";
import Button from "@components/general/Button";
import { TictactoeItem } from "@gabrieltlatuani/gabriel_test1.tictactoe_item";
import style from "@components/forinstructors/games/TicTacToe/TicTacToe.module.css"
import celebration from "@components/forinstructors/games/TicTacToe/celebration.png"


const { publicRuntimeConfig } = getConfig();

// Hook
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount


  return windowSize;
}

const TicTacToeStudent = (props) =>
{
    const ClassId = sessionStorage.getItem('classId')
    const size = useWindowSize()

  let ActivityID = props.data.ActivityID
  let action = props.data.action
  let randomOrder = props.data.ticTacToeResponseData.order

  let currentFlippedCards = []

  const [reset, setReset] = useState(false)
  const [gameData, setGameData] = useState(null)
  const [cardsData, setCardsData] = useState(null)
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [TicTacToeId, setTicTacToeId] = useState(null)
  const [cardback, setCardback] = useState("")
  const [title, setTitle] = useState('')
  const [subtitle, setSubTitle] = useState('')
  const [winner, setWinner] = useState(null)

  const [rOrder, setROrder] = useState([])

  const [flippedCards, setFlippedCards] = useState([])


  const getActivityStart = async () =>
  {
    const response = (await API.graphql({
      query: GET_TIC_TIC_TOE_BY_ACTIVITYID,
      variables: { ActivityID: ActivityID },
    })) as { data: any };

    const responseActivity = (await API.graphql({
      query: GET_ACTIVITY_BY_ID,
      variables: { Id: ActivityID },
    })) as { data: any };

    setROrder(randomOrder)

    setGameData(response.data.getTicTacToeByActivityID.data);
    setCardback(responseActivity.data.getActivityById.data[0].Cardback);
    setTitle(responseActivity.data.getActivityById.data[0].Title)
    setSubTitle(responseActivity.data.getActivityById.data[0].Subtitle)
    setCardsData(response.data.getTicTacToeByActivityID.data.Details);

    if(window.innerWidth != undefined && window.innerWidth <= 766)
    {
        console.log("It's mobile");

        let cardsArray = document.getElementsByClassName("flip-card")
        let containersArray = document.getElementsByClassName("flip-card-container")
        let orderSpans = document.getElementsByClassName("order")

        for(let i=0; i<cardsArray.length; i++)
        {
            let card = cardsArray[i] as HTMLElement;
            card.style.width = "86px";
            card.style.height = "86px";

            let containerItem = containersArray[i]as HTMLElement;
            containerItem.style.width = "86px";

            let orderSpanItem = orderSpans[i] as HTMLElement;
            orderSpanItem.style.fontSize = "50px"
        }
    }
    else
    {
        console.log("It's tablet or desktop");

        let cardsArray = document.getElementsByClassName("flip-card")
        let containersArray = document.getElementsByClassName("flip-card-container")
        let orderSpans = document.getElementsByClassName("order")

        for(let i=0; i<cardsArray.length; i++)
        {
            let card = cardsArray[i] as HTMLElement;
            card.style.width = "142px";
            card.style.height = "142px";

            let containerItem = containersArray[i]as HTMLElement;
            containerItem.style.width = "142px";

            let orderSpanItem = orderSpans[i] as HTMLElement;
            orderSpanItem.style.fontSize = "80px"
        }
    }


    const subscription = await API.graphql(
      graphqlOperation(GAME_SUBSCRIPTION, { ClassId: ClassId })
    );

    if ("subscribe" in subscription)
    {
      subscription.subscribe({
        next: ({ value }: any) =>
        {
          if (value.data.realTimeGamesSubscription.action == "Select a card")
          {
              console.log("Request to Flip a card", value.data.realTimeGamesSubscription.ticTacToeResponseData.TicTacToeId);

              let card = document.getElementById("card-" + value.data.realTimeGamesSubscription.ticTacToeResponseData.TicTacToeId)

              if( currentFlippedCards.includes(value.data.realTimeGamesSubscription.ticTacToeResponseData.TicTacToeId) )
              {
                  card.style.transform = "rotateY(0)"

                  currentFlippedCards.map((element, index) =>
                  {
                      if(element == value.data.realTimeGamesSubscription.ticTacToeResponseData.TicTacToeId)
                      {
                          currentFlippedCards.splice(index, 1)
                      }
                  })

                  // setFlippedCards(currentFlippedCards)
              }
              else
              {
                  currentFlippedCards.push(value.data.realTimeGamesSubscription.ticTacToeResponseData.TicTacToeId)
                  card.style.transform = "rotateY(180deg)"
              }

          }
          else if(value.data.realTimeGamesSubscription.action == "StudentName")
          {
              console.log(value.data.realTimeGamesSubscription.ticTacToeResponseData)

              let input = (document.getElementById("p-" + value.data.realTimeGamesSubscription.ticTacToeResponseData.TicTacToeId) as HTMLInputElement)

              if(input != null && input != undefined)
              {
                  input.value = value.data.realTimeGamesSubscription.ticTacToeResponseData.StudentName
              }

          }
          else if(value.data.realTimeGamesSubscription.action == "winner")
          {
              setWinner(value.data.realTimeGamesSubscription.ticTacToeResponseData.StudentName)
          }
          else if (value.data.realTimeGamesSubscription.action == "reset")
          {
              randomOrder = value.data.realTimeGamesSubscription.ticTacToeResponseData.order
              resetGame()

            console.log(value.data);

          }
        },
        error: (error) =>
        {
          console.warn("AQUÍ 2", error);
        },
      });
    }

  }


useEffect(() =>
{
    getActivityStart();

}, [])

useEffect(() =>
{
    if(size.width != undefined && size.width <= 766)
    {
        console.log("It's mobile");

        let cardsArray = document.getElementsByClassName("flip-card")
        let containersArray = document.getElementsByClassName("flip-card-container")
        let orderSpans = document.getElementsByClassName("order")

        for(let i=0; i<cardsArray.length; i++)
        {
            let card = cardsArray[i] as HTMLElement;
            card.style.width = "86px";
            card.style.height = "86px";

            let containerItem = containersArray[i]as HTMLElement;
            containerItem.style.width = "86px";

            let orderSpanItem = orderSpans[i] as HTMLElement;
            orderSpanItem.style.fontSize = "50px"
        }
    }
    else
    {
        console.log("It's tablet or desktop");

        let cardsArray = document.getElementsByClassName("flip-card")
        let containersArray = document.getElementsByClassName("flip-card-container")
        let orderSpans = document.getElementsByClassName("order")

        for(let i=0; i<cardsArray.length; i++)
        {
            let card = cardsArray[i] as HTMLElement;
            card.style.width = "142px";
            card.style.height = "142px";

            let containerItem = containersArray[i]as HTMLElement;
            containerItem.style.width = "142px";

            let orderSpanItem = orderSpans[i] as HTMLElement;
            orderSpanItem.style.fontSize = "80px"
        }
    }

}, [size])


useEffect(() =>
{
  if (reset) {

    setTimeout(() => {
        setReset(false);

        if(window.innerWidth != undefined && window.innerWidth <= 766)
        {
            console.log("It's mobile");

            let cardsArray = document.getElementsByClassName("flip-card")
            let containersArray = document.getElementsByClassName("flip-card-container")
            let orderSpans = document.getElementsByClassName("order")

            for(let i=0; i<cardsArray.length; i++)
            {
                let card = cardsArray[i] as HTMLElement;
                card.style.width = "86px";
                card.style.height = "86px";

                let containerItem = containersArray[i]as HTMLElement;
                containerItem.style.width = "86px";

                let orderSpanItem = orderSpans[i] as HTMLElement;
                orderSpanItem.style.fontSize = "50px"
            }
        }
        else
        {
            console.log("It's tablet or desktop");

            let cardsArray = document.getElementsByClassName("flip-card")
            let containersArray = document.getElementsByClassName("flip-card-container")
            let orderSpans = document.getElementsByClassName("order")

            for(let i=0; i<cardsArray.length; i++)
            {
                let card = cardsArray[i] as HTMLElement;
                card.style.width = "142px";
                card.style.height = "142px";

                let containerItem = containersArray[i]as HTMLElement;
                containerItem.style.width = "142px";

                let orderSpanItem = orderSpans[i] as HTMLElement;
                orderSpanItem.style.fontSize = "80px"
            }
        }

    }, 300);
  }
}, [reset]);

const resetGame = async () =>
{
    setReset(true)

    setWinner(null)
    setTicTacToeId(null)

    setROrder(randomOrder)
    currentFlippedCards= []


  console.log("Game reseted");
  // setReset(true);
};

  return (
    <div className={style.TicTacToeOuter}>
    <h2>{ title }</h2>
    <h3>{ subtitle }</h3>
      <div className={style.TicTacToeContainer} >
          { reset == false && rOrder.length > 0 && winner == null && cardsData != null
            ? rOrder.map((el, index) =>
            {
                let element = cardsData[el - 1]

                return(
                    <div key={ element.Id } className={style.TicTacToeInner}>
            			<div className={style.TicTacToeInner2} >
                            <TictactoeItem key={element.Id}
                              order={ index + 1 }
                              text={ element.Text }
                              cardback={ cardback }
                              type={element.Type.toString()}
                			    imageurl={element.ImageUrl}
                			    id={element.Id}
                              disabled={true}
                              status={ flippedCards.includes(element.Id) ? "revealed" : "hidden" }
                              componentTarget={ "student" }
                              StudentName={ element.StudentName }
                            />
                        </div>
                    </div>
                )
            })
            : null}

      </div>


      { winner != null ?
          <div className={style.winnerBanner}>
            <img src={ celebration.src } />
            <div className={style.winnerBannerInner}>
                <span>{winner}</span>
            </div>
          </div> : null
      }


      <div>

      </div>

    </div>
  );
};

export default TicTacToeStudent;
