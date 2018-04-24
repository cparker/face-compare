let page
let cameraFrontBack = 'front'
let chosenCanvas

function init() {
    console.log('init')
    page = getPageElements()

    const divWidth = page.leftImageDivElm.clientWidth
    const computedHeight = getNewImageHeight(page.sampleHeadshotElm, divWidth)

    page.computedImageWidth = divWidth
    page.computedImageHeight = computedHeight

    console.log(`computed w h ${page.computedImageWidth} ${page.computedImageHeight}`)

    page.leftImageDivElm.style.height = `${page.sampleHeadshotElm.height * (divWidth / page.sampleHeadshotElm.width)}px`
    page.rightImageDivElm.style.height = `${page.sampleHeadshotElm.height * (divWidth / page.sampleHeadshotElm.width)}px`
    // page.leftImageCanvasCtx.drawImage(page.sampleHeadshotElm, 0, 0, divWidth, computedHeight)
    page.leftImageCanvasCtx.drawImage(page.sampleHeadshotElm, 0, 0, page.leftImageCanvasElm.width, page.leftImageCanvasElm.height)

    // page.rightImageCanvasElm.width = page.sampleHeadshotElm.width
    // page.rightImageCanvasElm.height = page.sampleHeadshotElm.height
    page.rightImageCanvasCtx.drawImage(page.sampleHeadshotElm, 0, 0, page.rightImageCanvasElm.width, page.rightImageCanvasElm.height)

    page.leftImageDivElm.addEventListener('click', handleImageTouch)
    page.rightImageDivElm.addEventListener('click', handleImageTouch)
    page.cameraDirectionBtn.addEventListener('click', handleCameraDir)

    page.mainCameraIcon.addEventListener('click', takePicture)
    page.compareBtn.addEventListener('click', handleCompare)

    page.compareMenuButton.addEventListener('click', handleCompareMenu)
    page.happySadButton.addEventListener('click', handleHappySadMenu)

    page.happySadCameraIcon.addEventListener('click', handleHappySadTakePicture)
}

const frontConstraints = {
    audio: false,
    video: {
        facingMode: 'user'
    }
}

const backConstraints = {
    audio: false,
    video: {
        facingMode: 'environment'
    }
}

function handleCompareMenu() {
    page.mainMenuPage.style.display = 'none'
    showResultsPage()
}

function handleHappySadMenu() {
    page.mainMenuPage.style.display = 'none'
    page.happySadPage.style.display = 'flex'
    showHappySadVideoPreview()
}

function handleHappySadTakePicture() {
    page.happySadCanvas.width = page.happySadVideoPreview.videoWidth
    page.happySadCanvas.height = page.happySadVideoPreview.videoHeight
    // page.happySadCanvas.height = page.happySadVideoPreview.videoHeight * (page.body.clientWidth / page.happySadVideoPreview.videoWidth )
    page.happySadCanvas.height = 400
    console.log(`canvas w h ${page.happySadCanvas.width} ${page.happySadCanvas.height}`)
    console.log(`canvas client w h ${page.happySadCanvas.clientWidth} ${page.happySadCanvas.clientHeight}`)
    console.log(`canvas scroll w h ${page.happySadCanvas.scrollWidth} ${page.happySadCanvas.scrollHeight}`)
    console.log(`canvas offset w h ${page.happySadCanvas.offsetWidth} ${page.happySadCanvas.offsetHeight}`)

    const canvasCtx = page.happySadCanvas.getContext('2d')
    page.happySadCanvasDiv.style.display = 'block'
    canvasCtx.drawImage(page.happySadVideoPreview, 0, 0)
    page.happySadVideoPreview.style.display = 'none'
}

function handleCompare() {
    const post = {
        leftImage: page.leftImageCanvasElm.toDataURL(),
        rightImage: page.rightImageCanvasElm.toDataURL()
    }

    fetch('/doCompare', {
        method: 'POST',
        body: JSON.stringify(post),
        headers: {
            'content-type': 'application/json'
        }
    }).then(result => {
        return result.json()
    }).then(json => {
        console.log('compareResult', json)
        let simValue
        if (json.FaceMatches && json.FaceMatches.length > 0) {
            simValue = json.FaceMatches[0].Similarity
        } else if (json.UnmatchedFaces && json.UnmatchedFaces.length > 0) {
            simValue = json.UnmatchedFaces[0].Similarity
        } else {
            simValue = '--'
        }

        page.similarityValue.innerHTML = `${simValue}`
    })
}

function handleCameraDir() {
    cameraFrontBack = cameraFrontBack === 'front' ? 'back' : 'front'
    showVideoPreview()
}

/*
imageFilesIcon.addEventListener('click', () => {
    imageUpload.click()
})
*/

function setImageIndexField() {
    imageIndexField.innerHTML = imageIndex === 0 ? 'first' : 'second'
}

function handleImageTouch(event) {
    chosenCanvas = event.srcElement
    console.log('touched', event.srcElement.parentElement)
    showVideoPage()
    showVideoPreview()
}

function showVideoPage() {
    page.resultsPage.style.display = 'none'
    page.previewPage.style.display = 'flex'
}

function showResultsPage() {
    // first set display
    page.resultsPage.style.display = 'flex'
    page.previewPage.style.display = 'none'

    // then compute sizes
    const divWidth = page.leftImageDivElm.clientWidth
    const computedHeight = getNewImageHeight(page.sampleHeadshotElm, divWidth)

    page.computedImageWidth = divWidth
    page.computedImageHeight = computedHeight

    console.log(`computed w h ${page.computedImageWidth} ${page.computedImageHeight}`)

    page.leftImageDivElm.style.height = `${page.sampleHeadshotElm.height * (divWidth / page.sampleHeadshotElm.width)}px`
    page.rightImageDivElm.style.height = `${page.sampleHeadshotElm.height * (divWidth / page.sampleHeadshotElm.width)}px`
    // page.leftImageCanvasCtx.drawImage(page.sampleHeadshotElm, 0, 0, divWidth, computedHeight)
    page.leftImageCanvasCtx.drawImage(page.sampleHeadshotElm, 0, 0, page.leftImageCanvasElm.width, page.leftImageCanvasElm.height)

    // page.rightImageCanvasElm.width = page.sampleHeadshotElm.width
    // page.rightImageCanvasElm.height = page.sampleHeadshotElm.height
    page.rightImageCanvasCtx.drawImage(page.sampleHeadshotElm, 0, 0, page.rightImageCanvasElm.width, page.rightImageCanvasElm.height)

}

function showHappySadVideoPreview() {
    const constraints = cameraFrontBack === 'front' ? frontConstraints : backConstraints
    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            page.happySadVideoPreview.srcObject = stream
            page.happySadVideoPreview.addEventListener('loadedmetadata', x => {
                console.log('loadmetadata', x)
                page.happySadVideoPreview.play()
            })
        })
        .catch(err => {
            console.log('caught video error', err)
        })
}

function showVideoPreview() {
    const constraints = cameraFrontBack === 'front' ? frontConstraints : backConstraints
    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            page.videoPreview.srcObject = stream
            page.videoPreview.addEventListener('loadedmetadata', x => {
                console.log('loadmetadata', x)
                page.videoPreview.play()
            })
        })
        .catch(err => {
            console.log('caught video error', err)
        })
}

/*
mainCameraIcon.addEventListener('click', () => {
    setImageIndexField()

    resultsPage.style.display = 'none'
    previewPage.style.display = 'flex'
    videoPreview.style.width = `${document.width}px`

})
*/

function takePicture() {
    const videoCurrentHeight = page.videoPreview.videoHeight
    // const scaledVideoSnapHeight = videoCurrentHeight * (page.computedImageWidth / page.videoPreview.videoWidth)
    chosenCanvas.width = page.videoPreview.videoWidth
    chosenCanvas.height = page.videoPreview.videoHeight
    const newDivHeight = page.videoPreview.videoHeight * (page.computedImageWidth / page.videoPreview.videoWidth)
    page.leftImageDivElm.style.height = `${newDivHeight}px`
    page.rightImageDivElm.style.height = `${newDivHeight}px`
    const canvasCtx = chosenCanvas.getContext('2d')
    // canvasCtx.drawImage(page.videoPreview, 0, 0, page.computedImageWidth, scaledVideoSnapHeight)
    // canvasCtx.drawImage(page.videoPreview, 0, 0, chosenCanvas.width, chosenCanvas.height)
    canvasCtx.drawImage(page.videoPreview, 0, 0)
    showResultsPage()
}

// HANDLE TAKING SNAPSHOT
/*
page.videoPreview.addEventListener('click', () => {
    console.log('SNAP')
    const videoCurrentHeight = page.videoPreview.videoHeight
    const scaledVideoSnapHeight = videoCurrentHeight * (divWidth / videoPreview.videoWidth)
    let canvasElm = imageIndex === 0 ? leftImageCanvasElm : rightImageCanvasElm
    let canvasCtx = imageIndex === 0 ? leftImageCanvasCtx : rightImageCanvasCtx
    canvasElm.height = scaledVideoSnapHeight
    canvasCtx.drawImage(videoPreview, 0, 0, divWidth, scaledVideoSnapHeight)
    if (imageIndex === 0) {
        imageIndex++
        setImageIndexField()
    } else {
        resultsPage.style.display = 'flex'
        previewPage.style.display = 'none'
        imageIndex = 0
    }
})

*/

function getNewImageWidth(img, newHeight) {
    return img.width * (newHeight / img.height)
}

function getNewImageHeight(img, newWidth) {
    return img.height * (newWidth / img.width)
}

function getNumFromPx(px) {
    return parseInt(px.substr(0, px.indexOf('px')))
}

function getPageElements() {
    const pageObj = {}
    pageObj.sampleHeadshotElm = document.querySelector('.sample-headshot')
    pageObj.body = document.querySelector('body')
    pageObj.leftImageDivElm = document.querySelector('.results .left-image')
    pageObj.leftImageCanvasElm = document.querySelector('.results .left-image canvas')
    pageObj.leftImageCanvasCtx = pageObj.leftImageCanvasElm.getContext('2d')
    pageObj.rightImageDivElm = document.querySelector('.results .right-image')
    pageObj.rightImageCanvasElm = document.querySelector('.results .right-image canvas')
    pageObj.rightImageCanvasCtx = pageObj.rightImageCanvasElm.getContext('2d')
    pageObj.resultsPage = document.querySelector('.results-column')
    pageObj.previewPage = document.querySelector('.preview')
    pageObj.videoPreview = document.querySelector('.video-preview')
    pageObj.happySadVideoPreview = document.querySelector('.happy-sad-page video')
    pageObj.mainCameraIcon = document.querySelector('.preview .bottom-menu .main-camera')
    pageObj.imageFilesIcon = document.querySelector('.bottom-menu .image-files')
    pageObj.cameraDirectionBtn = document.querySelector('.bottom-menu .direction')
    pageObj.imageUpload = document.querySelector('#upload')
    pageObj.imageIndexField = document.querySelector('.top-message .snapshot-index')
    pageObj.compareBtn = document.querySelector('.compare')
    pageObj.similarityValue = document.querySelector('.similarityValue')
    pageObj.mainMenuPage = document.querySelector('.main-menu')
    pageObj.compareMenuButton = document.querySelector('.menu-item.compare-faces')
    pageObj.happySadButton = document.querySelector('.menu-item.happy-sad')
    pageObj.happySadPage = document.querySelector('.happy-sad-page')
    pageObj.happySadCameraIcon = document.querySelector('.happy-sad-page .bottom-menu .main-camera')
    pageObj.happySadCanvas = document.querySelector('.happy-sad-page .still')
    pageObj.happySadCanvasDiv = document.querySelector('.happy-sad-page .happy-sad-still')
    return pageObj
}

window.onload = () => {
    init()
}