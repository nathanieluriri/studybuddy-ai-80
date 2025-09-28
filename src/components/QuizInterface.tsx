import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  Trophy,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Note, Question, Answer } from '@/types';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface QuizInterfaceProps {
  note: Note;
  onBack: () => void;
}

export function QuizInterface({ note }: QuizInterfaceProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [quizState, setQuizState] = useState<'setup' | 'taking' | 'results'>('setup');
  const [results, setResults] = useState<any>(null);
  const [quizSettings, setQuizSettings] = useState({
    type: 'multiple_choice',
    difficulty: 'medium',
    count: 5
  });
  const { toast } = useToast();

  const generateQuiz = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.generateQuestions(
        note.id,
        quizSettings.type,
        quizSettings.count,
        quizSettings.difficulty
      );
      
      setQuestions((response as any).questions || []);
      setQuizState('taking');
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setSelectedAnswer('');
    } catch (error) {
      toast({
        title: 'Failed to generate quiz',
        description: 'Please try again with different settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) return;

    const newAnswer: Answer = {
      question: questions[currentQuestionIndex].question,
      answer: selectedAnswer
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
    } else {
      submitQuiz(updatedAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: Answer[]) => {
    setIsLoading(true);
    try {
      const response = await apiClient.submitAnswers(note.id, finalAnswers);
      setResults(response);
      setQuizState('results');
    } catch (error) {
      toast({
        title: 'Failed to submit quiz',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuizState('setup');
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setResults(null);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (quizState === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl">Generate Quiz</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Create AI-powered questions for: {note.title || note.filename}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <RadioGroup 
                  value={quizSettings.type} 
                  onValueChange={(value) => setQuizSettings({...quizSettings, type: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple_choice" id="multiple_choice" />
                    <Label htmlFor="multiple_choice">Multiple Choice</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short_answer" id="short_answer" />
                    <Label htmlFor="short_answer">Short Answer</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <RadioGroup 
                  value={quizSettings.difficulty} 
                  onValueChange={(value) => setQuizSettings({...quizSettings, difficulty: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="easy" id="easy" />
                    <Label htmlFor="easy">Easy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hard" id="hard" />
                    <Label htmlFor="hard">Hard</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <RadioGroup 
                  value={quizSettings.count.toString()} 
                  onValueChange={(value) => setQuizSettings({...quizSettings, count: parseInt(value)})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="count3" />
                    <Label htmlFor="count3">3 Questions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="count5" />
                    <Label htmlFor="count5">5 Questions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="10" id="count10" />
                    <Label htmlFor="count10">10 Questions</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <Button 
              onClick={generateQuiz} 
              disabled={isLoading}
              variant="gradient"
              className="w-full"
            >
              {isLoading ? 'Generating Questions...' : 'Generate Quiz'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizState === 'taking' && currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold leading-relaxed">
                {currentQuestion.question}
              </h3>

              {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
                <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-secondary/50 transition-colors">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <textarea
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  placeholder="Enter your answer here..."
                  className="w-full p-3 border rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={resetQuiz}>
                Cancel Quiz
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer || isLoading}
                variant="gradient"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizState === 'results' && results) {
    const score = (results as any).score || 0;
    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-success">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
            <div className="text-3xl font-bold text-primary mt-2">
              {score}/{totalQuestions}
            </div>
            <div className="text-lg text-muted-foreground">
              {percentage}% Correct
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Review:</h3>
              {answers.map((answer, index) => {
                const question = questions[index];
                const isCorrect = (results as any).gradedAnswers?.[index]?.isCorrect || false;
                
                return (
                  <div key={index} className="p-4 rounded-lg border space-y-2">
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{question.question}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your answer: {answer.answer}
                        </p>
                        {!isCorrect && question.correctAnswer && (
                          <p className="text-sm text-accent mt-1">
                            Correct answer: {question.correctAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={resetQuiz} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="gradient" onClick={resetQuiz} className="flex-1">
                Generate New Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <div>Loading...</div>;
}