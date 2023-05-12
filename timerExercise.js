// Credit: Mateusz Rybczonec, James Lyndsay
// Modified from https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/

// Looks like validation is based on hh:mm, not mm:ss
// thresholds not re-calculated on change
// ? how does s->s animation work
// seems to run slightly longer than circle
//      does it start at start, or start +1 


function setUpTimer(TIME_LIMIT) {
    const FULL_DASH_ARRAY = 283;
    const WARNING_THRESHOLD = TIME_LIMIT / 2;
    const ALERT_THRESHOLD = 5;

    const COLOR_CODES = {
        info: {
            color: "green"
        },
        warning: {
            color: "orange",
            threshold: WARNING_THRESHOLD
        },
        alert: {
            color: "red",
            threshold: ALERT_THRESHOLD
        }
    };



    let timePassed = 0;
    let timeLeft = TIME_LIMIT;
    let timerInterval = null;
    let remainingPathColor = COLOR_CODES.info.color;

    setupMachine();

    function setupMachine() {
        let startButton = document.getElementById("startButton")
        let stopButton = document.getElementById("stopButton")
        let timerElement = document.getElementById("base-timer-path-remaining")
        let showTimeElement = document.getElementById("base-timer-label")

        function switchToWarning() {
            timerElement.classList.remove(COLOR_CODES.info.color);
            timerElement.classList.add(COLOR_CODES.warning.color);
        }

        function switchToAlert() {
            timerElement.classList.remove(COLOR_CODES.warning.color);
            timerElement.classList.add(COLOR_CODES.alert.color);
        }

        function setupInitialTimerViewAndButtons() {
            startButton.addEventListener("click", pressStart)
            stopButton.addEventListener("click", pauseTimer)

            drawTime(TIME_LIMIT); // LEAVE OUT FOR BUG
            timerElement.classList.add(remainingPathColor);
        }

        setupInitialTimerViewAndButtons()

        let eventStuf = ["input", "paste"]; //"focus", "blur", "keyup", for bugs...

        eventStuf.forEach((eventType) => { showTimeElement.addEventListener(eventType, userChangedTime); })

        function pressStart(e) {
            showTimeElement.contentEditable = false;
            startButton.disabled = true;
            startTimer();
        }

        function pauseTimer(e) {
            showTimeElement.contentEditable = true;
            startButton.disabled = false;
            onTimesUp();
        }


        function startTimer() {
            timerInterval = setInterval(() => {
                timePassed = timePassed += 1;
                timeLeft = TIME_LIMIT - timePassed;
                drawTime(timeLeft);

                if (timeLeft === 0) {
                    onTimesUp();
                }
            }, 900);
        }

        function drawTime(timeLeft) {
            function setRemainingPathColor(timeLeft) {
                if (timeLeft <= COLOR_CODES.alert.threshold) {
                    switchToAlert()
                } else if (timeLeft <= COLOR_CODES.warning.threshold) {
                    switchToWarning()
                }
            }

            function setCircleDasharray() {
                const circleDasharray = `${(
                    calculateTimeFraction() * FULL_DASH_ARRAY
                ).toFixed(0)} 283`;
                console.log(circleDasharray);
                timerElement.setAttribute("stroke-dasharray", circleDasharray);
            }
            showTimeElement.innerHTML = formatTime(timeLeft);

            setCircleDasharray( );
            setRemainingPathColor(timeLeft);
        }

        function userChangedTime(e) {

            function changeTime(inboundTime) {
                console.log("changing time")
                var time_arr = inboundTime.split(":");
                console.log(time_arr)
                var newTime = time_arr[0] * 60 + time_arr[1]
                TIME_LIMIT = newTime;
                drawTime(newTime);
            }
            function showInvalidFormat() {
                showTimeElement.classList.add("invalidFormat");
                console.log("showing invalid time")
                console.log(timerElement)
            }
            function showValidFormat() {
                showTimeElement.classList.remove("invalidFormat");
                console.log("showing valid time")
            }
            //console.log(e)

            if (validTime(e.target.innerText)) {
                showValidFormat()
                changeTime(e.target.innerText)
            } else {
                showInvalidFormat()
            }
        }
    }





    function onTimesUp() {
        clearInterval(timerInterval);
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        let seconds = time % 60;

        if (seconds < 10) {
            seconds = `0${seconds}`;
        }

        return `${minutes}:${seconds}`;
    }

    function calculateTimeFraction() {
        const rawTimeFraction = timeLeft / TIME_LIMIT;
        return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
    }

    function validTime(inboundTime) {
        //console.log("validating time"+inboundTime)
        // from https://stackoverflow.com/questions/11400822/javascript-regex-validate-time
        // use this function to  validate time in HH:mm formate
        var a = true;
        var time_arr = inboundTime.split(":");
        if (time_arr.length != 2) {
            a = false;
        } else {
            if (isNaN(time_arr[0]) || isNaN(time_arr[1])) {
                a = false;
            }
            if (time_arr[0] < 24 && time_arr[1] < 60) {

            } else {
                a = false;
            }
        }
        return a;
    }

}


