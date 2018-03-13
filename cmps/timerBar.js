export default {
    template: `
    <section>
        <div id="timer-progress">
            <div id="timer-bar"></div>
        </div>
    </section>
    `,
    props: ['timer'],
    methods: {
        move() {
            var elTimer = document.getElementById("timer-bar");   
            var width = 1;
            var id = setInterval(frame, (this.timer / 100));
            
            function frame() {
                if (width >= 100) {
                    clearInterval(id);
                } else {
                    width++; 
                    elTimer.style.width = width + '%'; 
                }
            }
        },
        setTimer() {
            return surveyService.getPromoTimer();
        }
    },
    mounted() {
        this.move();
    }
}