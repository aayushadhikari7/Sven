import { useState, useEffect } from 'react';
import moment from 'moment';
import useLocalStorage from 'use-local-storage-state';
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


export default function TaskPage() {
  const [taskList, setTaskList] = useState([]);
  const [name, setName] = useState('');
  const [storedTasks, setStoredTasks] = useLocalStorage('tasks', []);
  const [upcomingTasks, setUpcomingTasks] = useLocalStorage('upcomingTasks', []);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (storedTasks && storedTasks.length) {
      setTaskList(storedTasks);
    }
  }, [storedTasks]);

  useEffect(() => {
    if (upcomingTasks && upcomingTasks.length) {
      setUpcomingTasks(upcomingTasks);
    }
  }, [upcomingTasks]);

  const addTask = async (e) => {
    e.preventDefault();
    const newTask = { id: taskList.length + 1, name, addedTime: moment().format('MMMM Do YYYY, h:mm:ss a') };
    setTaskList([...taskList, newTask]);
    setName('');
  }

  // const app = express();
  //   app.use(bodyParser.json());
  //   app.use(cors());

    // Generate summary
   const SummaryButton = ({ taskList }) => {
  const [summary, setSummary] = useState(null);}

  const generateSummary = async () => {
    const prompt = `Summarize the user's task list:\n\n${taskList.map(task => `- ${task.name}\n`).join('')}`;
    const completions = await openai.Completion.create({
      engine: 'text-davinci-002',
      prompt,
      maxTokens: 64,
      n: 1,
      stop: ['\n'],
    });
    const summary = completions.choices[0].text.trim();
    setSummary(summary);
  };

  const deleteTask = (id) => {
    const updatedList = taskList.filter((task) => task.id !== id);
    setTaskList(updatedList);
  };

  useEffect(() => {
    setStoredTasks(taskList);
  }, [taskList]);

  useEffect(() => {
    setUpcomingTasks(
      taskList
        .filter((task) => moment(task.addedTime).diff(moment(), 'days') <= 7)
        .sort((a, b) => moment(a.addedTime).diff(moment(b.addedTime)))
        .slice(0, 3)
    );
  }, [taskList]);  

  return (
    <div className="w-full">
      <h1 className="font-bold ml-10">Clarity,</h1>
      <sub className="mx-10 my-10 font-semibold ml-20 italic" >smart AI task assistant</sub>
      <br />
      <div className="float-left w-1/2">
        <form onSubmit={addTask}>
          <h2 className="font-bold mx-12 mt-10">Tasks</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Task name"
            className="mx-12 px-3 py-2 border-2 border-black rounded-md shadow-md"
            required
          />
          <button type="submit" className="hover:bg-green-700 rounded p-1">
            Add Task
          </button>
        </form>
        {taskList && taskList.length > 0 ? (
          <ul>
            {taskList.map((task) => (
              <li className="mx-12 my-16" key={task.id}>
                Added Time : <strong>{task.addedTime}</strong>
                <button
                  className="ml-4 hover:bg-green-700 rounded p-1"
                  onClick={() => setSummary("")}
                >
                  Summarize
                </button>
                <button
                  className="hover:bg-red-700 text-black px-2 py-1 rounded ml-4"
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-12 mt-16">No tasks added yet</div>
        )}
      </div>
      <div className="float-right bg-sky-100 bg-opacity-50 w-1/2">
        <h2 className="font-bold mx-12 mt-10">Upcoming Tasks</h2>
        {storedTasks && storedTasks.length > 0 ? (
          <ul>
            {storedTasks.map((task) => (
              <li className="mx-12 my-16" key={task.id}>
                Due Time : {moment(task.dueDate).fromNow()} {/* Display time of 7 days */}
                <br />
                <div className="mt-5 border-2 p-5 flex-auto">
                  <strong>{task.name}</strong>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-12 mt-16">No upcoming tasks</div>
        )}
      </div>
    </div>
  );  
    } 