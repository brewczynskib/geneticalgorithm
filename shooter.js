//Bartosz Brewczyński- genetic algorithm
//Welcome :)
let shooter;
let generationNumber;
let rifleMan;
let cycles;
let steps;
let target;
let score;
let win;
let generation;
let maximum; // html
let max; // how much time target reached
let targetPositions;
let targetPositionsNumber;
let htmlHistory;
let history;
let xyArr;
let position;
function setup () {
    createCanvas(400, 600);
    shooter = createVector(width / 2, height - 5);
    generationNumber = 0 ;
    rifleMan = new Shooters();
    cycles = 200;
    steps= 0 ;
    target = createVector(width / 3 , 100);
    score = createP();
    win = createP();
    generation = createP();
    maximum = createP();
    max = 0 ;
    xyArr = [];
    targetPositions = createP();
    targetPositionsNumber = 0;
    htmlHistory = createP();
    history = new History();
    frameRate(60);
}


function draw()
{
    fill(150);
    stroke(150);
    //draw shooter , target and line between them
    noStroke();
    background(255, 204, 255);
    rectMode(CENTER);
    fill(255, 80, 80);
    rect(shooter.x , shooter.y , 10,20);
    fill(255, 102, 102);
    ellipse(target.x , target.y , 25,25);
    stroke(102, 0, 51);
    line(target.x , target.y , shooter.x , shooter.y);
    //start algorithm
    rifleMan.start();

    // show scores
    score.html(`steps: ${steps}`);
    win.html(`goal achieved: ${rifleMan.crew.filter(bullet=>bullet.aim === true).length}`);
    if(rifleMan.crew.filter(bullet=>bullet.aim === true).length > max)
    {
        max = rifleMan.crew.filter(bullet=>bullet.aim === true).length;
    }
    score.position(width +50,height/2);
    generation.position(width +50,height/2 + 20);
    win.position(width +50,height/2 + 40);
    maximum.position(width +50,height/2 +60);
    generation.html(`generation ${generationNumber}`);
    maximum.html(`max score ${max}`);
    targetPositions.html(`target changed position ${targetPositionsNumber} times`);
    targetPositions.position(width + 50 , height/2 + 80);

    steps++;
        if(steps === cycles)
    {
        generationNumber++;
        steps = 0;

        //if at least 50% of shooters reached target
        if(max >= rifleMan.crew.length/2)

        {
            max = 0;
            xyArr.push(new Position(target.x, target.y));
            targetPositionsNumber ++;
            history.showHistory(targetPositionsNumber,generationNumber,xyArr);

            target = createVector(random(0,width) , random(height/2 , height - 50));
            generationNumber=0;
        }
        rifleMan.evolve();
        rifleMan.reproduction();
    }

}


class RiflemanDna {

    constructor(pos,power)
    {
        this.maxPower = 10;
        if(pos && power)
        {
            this.pos = pos;
            this.powerUp = power;
        }
        else
            {
                this.pos = p5.Vector.random2D();
                this.pos.setMag(0.3);
                this.powerUp = random(this.maxPower);
            }
    }

    crossover(parent)
    {
        let pos;
        let power;

        if(random(1) < 0.5)
        {
            power = this.powerUp;
        }
        else power = parent.powerUp;

        if(random(1) < 0.5)
        {
            pos = this.pos;
        }
        else
            {
                pos = parent.pos;
            }


        return new RiflemanDna(pos, power);
    }

}

class Rifleman

    {
        constructor(dna)
        {
            if(dna)
            {
                this.dna = dna;
            }
            else{
                this.dna = new RiflemanDna();
            }

                this.bulletPosition = createVector(width/2,height-20);
                this.speed = createVector(0,-1);
                this.i = 0 ; // XD
                this.fittnes = 0;
                this.aim = false;
                this.walls = false;
            }

        shot()
            {
                if(this.i === 0) {
                    this.speed.rotate(this.dna.pos.heading());
                    this.speed.mult(this.dna.powerUp);
                    this.i++;
                }
                if(!this.aim && !this.walls) {
                    this.bulletPosition.add(this.speed);
                    this.airResistance(1.009);
                }
                this.checkIfReachedTarget();
                this.checkWalls();


        }


        checkWalls()
        {
            if(this.bulletPosition.x < 0
                || this.bulletPosition.x > width
                ||this.bulletPosition.y < 0
                ||this.bulletPosition.y > height)
            {
                this.walls = true;
            }
        }
        checkIfReachedTarget()
        {
            if(this.bulletPosition.dist(target) < 20)
            {
                this.aim = true;
                this.bulletPosition = target.copy();
                this.dna.greatPos = true;
            }
        }



        airResistance(force)
        {
            this.speed.div(force);
        }


        display()
        {
            push();
            noStroke();
            fill(255, 0, 102);
            translate(this.bulletPosition.x , this.bulletPosition.y);
            rotate(this.speed.heading());
            rectMode(CENTER);
            circle(0,0,3);
            pop();
        }

        calcFitness()
        {
            this.fittnes = this.bulletPosition.angleBetween(target);
            this.fittnes += 1/dist(this.bulletPosition.x , this.bulletPosition.y , target.x , target.y);
            if(this.aim)
            {
                this.fittnes = 100;
            }
            else if(this.walls)
            {
                this.fittnes *= 0.1;
            }
            return this.fittnes;
        }
    }



    class Shooters
    {

        constructor()
        {
            this.crew = [];
            this.pool = [];
            this.maxPopulation = 150;
            for (let i = 0; i < this.maxPopulation; i++) {
                this.crew[i] = new Rifleman();
            }
        }


        start()
        {
            for (let i = 0; i < this.maxPopulation ; i++) {
                this.crew[i].shot();
                this.crew[i].display();
            }

        }



        evolve()
        {
            let maxFit = 0 ;
            let fit;
            for (let i = 0; i < this.maxPopulation; i++) {
                fit = this.crew[i].calcFitness();
                if(fit > maxFit) maxFit = fit;
            }

            //normalize
            for (let i = 0; i < this.maxPopulation ; i++) {
                this.crew[i].fittnes /= maxFit;
                this.crew[i].fittnes *= 100;
            }

                this.createPool();
            }

            createPool()
            {
                for (let i = 0; i < this.maxPopulation; i++) {
                    for (let j = 0; j < this.crew[i].fittnes; j++) {
                        this.pool.push(this.crew[i].dna);
                    }
            }
            }

            reproduction()
            {
                let newCrew = [];
                for (let i = 0; i < this.maxPopulation; i++) {
                    let parentA = random(this.pool);
                    let parentB = random(this.pool);
                    let newDna = parentA.crossover(parentB);
                    newCrew[i] = new Rifleman(newDna);
                }

                this.crew = newCrew;
                this.mutation();

            }

            mutation()
            {
                for (let i = 0; i < this.maxPopulation; i++) {
                    if(random(1)< 0.1)
                    {
                        this.crew[i].dna.pos = p5.Vector.random2D();
                        this.crew[i].dna.powerUp = random(0,10);
                    }
                }
            }

    }


class History
{
    constructor()
    {
        this.targetPosNum = [];
        this.gener = [];

    }

    showHistory(targetPositionNum , generation,targetPosition)
    {
        if(targetPositionNum && generation)
        {
            this.targetPosNum.push(targetPositionNum);
            this.gener.push(generation);
            this.coordinates = targetPosition; // arr with all target pos

        }

        htmlHistory.remove();
        htmlHistory = createP().html(`History <br> `, true);

        for (let i = 0; i < this.gener.length ; i++) {

            htmlHistory.html(`Target: ${this.targetPosNum[i]}
                    - Target position: x:${round(targetPosition[i].x)}, y:${round(targetPosition[i].y)}
                    - generations: ${this.gener[i]} <br>` , true);

            htmlHistory.position(window.innerWidth -500 , 50);
        }
    }
}


class Position
{
    constructor(x,y)
    {
        if(x,y) {
            this.x = x;
            this.y = y;
        }
        else
            {
                this.x =0 ;
                this.y = 0;
            }
    }
}
