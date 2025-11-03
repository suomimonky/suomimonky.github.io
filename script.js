"use strict";

document.addEventListener("DOMContentLoaded", function() {
  const winbutton = document.getElementById("win")
  const homesection = document.getElementById("homesection");
  const startbtn = document.getElementById("start");
  let cardsIdsArray = [];
  let currentCardSlot = null;
  let unsortedCards = document.getElementById("unsortedCards");
  let sortedCards = document.getElementById("sortedCards");
  if (startbtn){
  startbtn.addEventListener("click", goToIndex); 
  fetchHomePage();
  }
  else if (winbutton){
    winbutton.addEventListener("click", function(){
      window.location.href = "index.html";
    })
  }
  else{
  document.addEventListener("dragstart", e => e.preventDefault());
  createCard("card", "cards");
  createCard("emptySlot", "emptySlots");
  createSubmitButton();
  fetchImage();
  sortCardIds();
  let isWin = false;
  let notSorted = false;
  const submitbutton = document.getElementById("submitbutton");
  submitbutton.addEventListener("click", scorePoints);
  
  //MOUSE DOWN EVENT LISTENER 
  unsortedCards.addEventListener("mousedown", mouseDownDrag);
  sortedCards.addEventListener("mousedown", mouseDownDrag);
  }
    function mouseDownDrag(e){
    // IF MOUSEDOWN ON CARDS
    if (e.target.classList.contains("cards")){
      //saving card and its position for later 
      const card = e.target;
      const initialPos = e.target.style.position;
      const parent = e.target.parentElement;
      const sibling = e.target.nextSibling;
      // save cursor position 
      const x = e.clientX;
      const y = e.clientY;
      //save card offset from topleft of page
      const cardStartX = card.offsetLeft;
      const cardStartY = card.offsetTop;
      card.style.position = "absolute";
      card.style.pointerEvents = "none";

      // calculate offset between initial cursor position and current cursor position
      function mouseMoveDrag(e){
      const offsetX = e.clientX - x;
      const offsetY = e.clientY - y;
      //move the card to the sum of that difference and the card's initial position
      card.style.left = (offsetX+cardStartX)+"px";
      card.style.top = (offsetY+cardStartY)+"px";}
  
      //checks whether mouse is currently over one of the card slots
      function mouseOverDrag(e){
        if(e.target.classList.contains("emptySlots")||e.target.classList.contains("cards")||e.target.id === "unsortedCards"){
          currentCardSlot = e.target;
          console.log("mouse over " +currentCardSlot.id);
        }
      }
      //if mouse out of that card slot, set the cardslot var back to null
      function mouseOutDrag(e){
        if(e.target.classList.contains("emptySlots")||e.target.classList.contains("cards")||e.target.id === "unsortedCards"){
          currentCardSlot = null;
          console.log("mouse out "+e.target.id);
        }
      }
      //if mouseup while mouseover a card slot, replace that card slot with the card, otherwise return to initial position
      function mouseUpDrag(){
        card.style.pointerEvents = "";
        checkMouseUp(card, currentCardSlot, parent, initialPos, sibling);
        
        document.removeEventListener("mousemove", mouseMoveDrag);
        document.removeEventListener("mouseup", mouseUpDrag);        
        sortedCards.removeEventListener("mouseover", mouseOverDrag);        
        unsortedCards.removeEventListener("mouseover", mouseOverDrag);        
        sortedCards.removeEventListener("mouseout", mouseOutDrag);        
        unsortedCards.removeEventListener("mouseout", mouseOutDrag);        
      }
      document.addEventListener("mousemove", mouseMoveDrag);
      document.addEventListener("mouseup", mouseUpDrag);
      sortedCards.addEventListener("mouseover", mouseOverDrag);
      unsortedCards.addEventListener("mouseover", mouseOverDrag);
      sortedCards.addEventListener("mouseout", mouseOutDrag);
      unsortedCards.addEventListener("mouseout", mouseOutDrag);
    }}

  function checkMouseUp(card, currentCardSlot, parent, initialPos, sibling){  
    if (currentCardSlot!=null){
      console.log("replacing");
      card.style.position = "";
      card.style.top = "";
      card.style.left = "";
      let cardToSwap = currentCardSlot;
      let cardParent = currentCardSlot.parentElement;
      let cardSibling = currentCardSlot.nextSibling;
          
      if (currentCardSlot.classList.contains("cards")){
        
        if (sibling){
        parent.insertBefore(cardToSwap, sibling)
        }
        else{
        parent.appendChild(cardToSwap);
        }
        cardToSwap.style.position="";
        cardToSwap.style.left=""
        cardToSwap.style.top="";
            
        cardParent.insertBefore(card, cardSibling);
      }
      else if (currentCardSlot.id === "unsortedCards"){
        currentCardSlot.appendChild(card);
        createEmptySlot(sibling);
      }
      else{
        currentCardSlot.replaceWith(card);
        if (parent.id === "sortedCards"){
          const emptySlot = document.createElement("section");
          emptySlot.classList.add("emptySlots");
          if (sibling && sibling.parentElement === parent){
            parent.insertBefore(emptySlot, sibling);
          }
          else{
            parent.appendChild(emptySlot);
          }
        }
      }
    }
    else{
      console.log("no slot");
      card.style.position =initialPos;
    }
  } 

  function sortCardIds(){
    cardsIdsArray.sort((a,b)=> a.date_end - b.date_end);
    cardsIdsArray = cardsIdsArray.map(cardsIdsArray => cardsIdsArray.id);
    console.log(cardsIdsArray);
  }

  function createCard(idname, classname){
  for(let i = 0; i<6; i++){
    const newCard = document.createElement("section");
    newCard.setAttribute("id", idname + i);
    console.log(newCard.id);
    newCard.classList.add(classname);
    if (idname === "card"){
      unsortedCards.appendChild(newCard);
      newCard.style.backgroundImage = "url(assets/placeholder.jpg)";
      newCard.textContent = newCard.id;
    }
    else {
      sortedCards.appendChild(newCard);
    }
    }
  }
  function createSubmitButton(){
    const submitsection = document.getElementById("submit");
    const submitbtn = document.createElement("button");
    submitbtn.setAttribute("id", "submitbutton");
    submitbtn.textContent = "Submit"
    submitsection.appendChild(submitbtn);
  }
  function createEmptySlot(sibling){
    const emptySlot = document.createElement("section");
    emptySlot.classList.add("emptySlots");
    if (sibling){
    sortedCards.insertBefore(emptySlot, sibling);
    }
    else{
      sortedCards.appendChild(emptySlot);
    }
  }

 function fetchImage(){
  let page = Math.floor(Math.random()*100);
  fetch("https://api.artic.edu/api/v1/artworks?page=" +page +"&limit=20")
  .then(response => {
    if (!response.ok){
      throw new Error("Response not ok", {cause: response})
    }
    else 
      return response.json(); })
    .then(data=> {
      console.log(data);
      let imageData = data.data
      //filter to avoid saving null image ids which messes everything up
      .filter(artwork => artwork.image_id != null)
      //saving the needed fields into imageData
      .map(artwork => ({
        image_id: artwork.image_id,
        title: artwork.title,
        date_end: artwork.date_end,
        id: artwork.id}));
      console.log(imageData);
      setCardImages(imageData);
      sortCardIds(imageData);
      })
      .catch(error => {
        console.log(error);
      });
    }
  function fetchHomePage(){
    fetch("https://api.artic.edu/api/v1/artworks/search?q=cats&limit=3&fields=title,image_id,date_end")
    .then(response => {
      if (!response.ok){
        throw new Error("Response not ok", {cause: response})
      }
      else 
        return response.json(); })
    .then(data=> {
      console.log(data);
      let imageData = data.data
      //filter to avoid saving null image ids which messes everything up
      .filter(artwork => artwork.image_id != null)
      //saving the needed fields into imageData
      .map(artwork => ({
        image_id: artwork.image_id,
        title: artwork.title,
        date_end: artwork.date_end,
        id: artwork.id}));
        setHomeImage(imageData);
      })
    .catch(error => {
      console.log(error);
    });
    }
    function setHomeImage(imageData){
      for (let i=0; i<3;i++){
        let homecard = document.createElement("section");
        homecard.classList.add("homecards");
        homesection.appendChild(homecard);
      }
      let homearray = Array.from(document.getElementsByClassName("homecards"));
      for (let i = 0;i<homearray.length;i++){
        let urlString = "url(https://www.artic.edu/iiif/2/" +imageData[i].image_id+"/full/843,/0/default.jpg)";
        homearray[i].style.backgroundImage = urlString;
        homearray[i].style.backgroundSize = "100% auto";
        homearray[i].textContent = imageData[i].title+"\n"+imageData[i].date_end;
      }
    }
    function setCardImages(imageData){
    let cards = document.getElementsByClassName("cards");
    console.log(Array.from(cards).length);
    let cardsArray = Array.from(cards);
    for (let i = 0; i<cards.length; i++){
    let urlString = "url(https://www.artic.edu/iiif/2/" +imageData[i].image_id+"/full/843,/0/default.jpg)";
    console.log(imageData[i]);
    cardsArray[i].style.backgroundImage = urlString;
    cardsArray[i].style.backgroundSize = "100% auto";
    cardsArray[i].textContent = imageData[i].title+"\n"+imageData[i].date_end;
    cardsArray[i].id = imageData[i].id;
    // console.log(cardsArray[i].id);
    }
    for (let i = 0 ; i<cards.length;i++){
      cardsIdsArray.push(imageData[i]);
    }
  }

  function goToIndex(){
    window.location.href = "app.html";
  }
  function scorePoints(){
    let isWin = compareArrays();
    if (isWin) {
      window.location.href = "winpage.html";
    }
  }
  function compareArrays(){
    let submittedCards = document.getElementsByClassName("cards");
    for (let i=0;i<submittedCards.length;i++){
      if (submittedCards[i].parentElement.id == "unsortedCards"){
        return false;
      }
    }
    submittedCards = Array.from(submittedCards).map(card => card.id);
    for (let i=0;i<submittedCards.length;i++){
      if (submittedCards[i]!=cardsIdsArray[i]){
        return false;
      }
    }
    return true;
  }
  })