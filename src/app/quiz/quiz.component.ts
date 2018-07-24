import { Component, OnInit } from '@angular/core';

import { QuizService } from '../services/quiz.service';
import { HelperService } from '../services/helper.service';
import { Option, Question, Quiz, QuizConfig } from '../models/index';



@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
  providers: [QuizService]
})
export class QuizComponent implements OnInit {
  buttonDisabled = true;
  isValid: boolean;
  correctAnswer = true;
  correctAnswers = [];
  results = [];
  correctCount = 0;
  quizes: any[];
  quiz: Quiz = new Quiz(null);
  mode = 'quizSelector';
  quizName: string;
  config: QuizConfig = {
    'allowBack': true,
    'allowReview': true,
    'autoMove': false,  // if true, it will move to next question automatically when answered.
    'duration': 3600,  // indicates the time (in secs) in which quiz needs to be completed. 0 means unlimited.
    'pageSize': 1,
    'requiredAll': false,  // indicates if you must answer all the questions before submitting.
    'richText': false,
    'shuffleQuestions': false,
    'shuffleOptions': false,
    'showClock': true,
    'showPager': true,
    'theme': 'none'
  };

  pager = {
    index: 0,
    size: 1,
    count: 1
  };
  timer: any = null;
  startTime: Date;
  endTime: Date;
  ellapsedTime = '00:00';
  duration = '';

  constructor(private quizService: QuizService) { }

  ngOnInit() {
    this.quizes = this.quizService.getAll();
    // this.quizName = this.quizes[0].id;
    // this.loadQuiz(this.quizName);
  }

  loadQuiz(quizName: string) {
    this.quizService.get(quizName).subscribe(res => {
      this.quiz = new Quiz(res);
      this.pager.count = this.quiz.questions.length;
      this.startTime = new Date();
      this.timer = setInterval(() => { this.tick(); }, 1000);
      this.duration = this.parseTime(this.config.duration);
    });
    this.mode = 'quiz';



  }

  tick() {
    const now = new Date();
    const diff = (now.getTime() - this.startTime.getTime()) / 1000;
    if (diff >= this.config.duration) {
      this.onSubmit();
    }
    this.ellapsedTime = this.parseTime(diff);
  }

  parseTime(totalSeconds: number) {
    let mins: string | number = Math.floor(totalSeconds / 60);
    let secs: string | number = Math.round(totalSeconds % 60);
    mins = (mins < 10 ? '0' : '') + mins;
    secs = (secs < 10 ? '0' : '') + secs;
    return `${mins}:${secs}`;
  }

  get filteredQuestions() {
    return (this.quiz.questions) ?
      this.quiz.questions.slice(this.pager.index, this.pager.index + this.pager.size) : [];
  }

  onSelect(question: Question, option: Option) {
    // This gives the option to only select 1 answer or multiple answers.
    // For questionTypeId = 1 there is only one answer that can me selected
    // For questionTypeId = 0 there can be multiple answers selected
    if (question.questionTypeId === 1) {
      question.options.forEach((x) => { if (x.id !== option.id) {x.selected = false; } });
    } else if (question.questionTypeId === 0) {
      question.options.forEach((x) => { if (x.id !== option.id && x.selected !== true) {x.selected = false; } });
    }

    if (this.config.autoMove) {
      this.goTo(this.pager.index + 1);
    }
  }

  goTo(index: number) {
    if (index >= 0 && index < this.pager.count) {
      this.pager.index = index;
      this.mode = 'quiz';
    }
  }

  isAnswered(question: Question) {
    return question.options.find(x => x.selected) ? 'Answered' : 'Not Answered';
  }


  isCorrect(question: Question) {
    // this returns if the question is correct or answered wrong
    return question.options.every(x => x.isAnswer === x.selected) ? 'correct' : 'wrong';
  }

  correctSelected(isAnswer: any, selected: any) {
        if (isAnswer === true && selected === true) {
          return 'alert-success';
        } else if (isAnswer === true && selected === false || selected === 'undefined') {
          return 'alert-warning';
        } else if (isAnswer === false && selected === true) {
          return 'alert-danger';
        } else {
          return 'alert-default';
        }
  }

  onSubmit() {
    const answers = [];
    this.quiz.questions.forEach(x => answers.push({ 'quizId': this.quiz.id, 'questionId': x.id, 'answered': x.answered }));
    // Post your data to the server here. answers contains the questionId and the users' answer.
    console.log(this.quiz.questions);
    this.quiz.questions.forEach(x => this.results.push(this.isCorrect(x)));
    this.results.forEach((x) => {if (x === 'correct')  {this.correctCount = this.correctCount + 1; } }) ;
    console.log(this.results);
    this.mode = 'result';
  }

  getCorrectCount() {
    return this.correctCount;
  }

  getWrongCount() {
    return this.results.length - this.correctCount;
  }

  getCorrectPercentage() {
    const correctPercentage = this.correctCount / this.results.length * 100;
    return Math.round(correctPercentage);
  }

  setColor() {
    const value = this.getCorrectPercentage();
    if (value > this.quiz.passThresHold) {
      return 'true';
    } else {
      return 'false' ;
    }
  }

  clearAll() {
    this.correctCount = 0;
    this.correctAnswers = [];
    this.results = [];
    this.loadQuiz(this.quizName);
    this.goTo(this.pager.index = 0);
  }

  passedOrFailed() {
    if (this.getCorrectPercentage() > this.quiz.passThresHold) {
      return 'PASSED';
    } else {
      return 'FAILED';
    }
  }

  getPassThresHold() {
    return this.quiz.passThresHold;
  }

  gotoSelector() {
    this.correctCount = 0;
    this.correctAnswers = [];
    this.results = [];
    this.loadQuiz(this.quizName);
    this.goTo(this.pager.index = 0);
    this.mode = 'quizSelector';
  }




}
