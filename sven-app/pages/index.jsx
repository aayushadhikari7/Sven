import { useState, useEffect } from 'react';
import moment from 'moment';
import useLocalStorage from 'use-local-storage-state';
import { createClient } from '@supabase/supabase-js'
const { Configuration, OpenAIApi } = require("openai");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


export default function TaskPage() {
  const [taskList, setTaskList] = useState([]);
  const storedTasks = taskList
  const [name, setName] = useState('');
  // const [storedTasks, setStoredTasks] = useLocalStorage('tasks',? []);
  // const [upcomingTasks, setUpcomingTasks] = useLocalStorage('upcomingTasks', []);
  const [summary, setSummary] = useState(null);

  // useEffect(() => {
  //   if (storedTasks && storedTasks.length) {
  //     setTaskList(storedTasks);
  //   }
  // }, [storedTasks]);

  // useEffect(() => {
  //   if (upcomingTasks && upcomingTasks.length) {
  //     setUpcomingTasks(upcomingTasks);
  //   }
  // }, [upcomingTasks]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: tasks_log, error } =
        await supabase.from('tasks_log').select('*')
        ;
      if (error) console.log(" Error fetching:", error);
      else setTaskList(tasks_log);
      console.log(tasks_log)
    };
    fetchData();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    // const newTask = { id: taskList.length + 1, name, addedTime: moment().format('MMMM Do YYYY, h:mm:ss a') };
    const newTask = { name };

    const { error, data } = await supabase
      .from('tasks_log')
      .insert({ task: newTask })
      .select()
    setTaskList([...taskList, data[0]]);
    setName('');
  }

  // const app = express();
  //   app.use(bodyParser.json());
  //   app.use(cors());

  // Generate summary
  const SummaryButton = ({ taskList }) => {
    const [summary, setSummary] = useState(null);
  }

  const generateSummary = async () => {
    const prompt = `Summarize the user's task list:\n\n${taskList.map(task => `- ${task.task.name}\n`).join('')}`;
    const completions = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 400,
    });
    console.log(completions)
    const summary = completions.data.choices[0].text.trim();
    setSummary(summary);
  };

  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks_log').delete().eq('id', id);
    const updatedList = taskList.filter((task) => task.id !== id);
    setTaskList(updatedList);

  };

  // useEffect(() => {
  //   setStoredTasks(taskList);
  // }, [taskList]);

  // useEffect(() => {
  //   setUpcomingTasks(
  //     taskList
  //       .filter((task) => moment(task.addedTime).diff(moment(), 'days') <= 7)
  //       .sort((a, b) => moment(a.addedTime).diff(moment(b.addedTime)))
  //       .slice(0, 3)
  //   );
  // }, [taskList]);  

  return (
    <div className="w-full">
      <div className='ml-10 mt-4'>
        <h1 className="font-black text-lg">Sven
        </h1>
        <span className=" ml-8 font-bold italic text-xs" >smart AI task assistant</span>
      </div>
      <br />
      <div className="float-left mt-6 w-1/2">
        <form onSubmit={addTask}>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Task name"
            className="mx-12 px-3 py-2 border-2 border-black rounded-md shadow-md"
            required
          />
          <button type="submit" className="hover:font-black hover:bg-blue-400 rounded p-1 uppercase font-bold text-sm bg-blue-300 mb-2 px-2 border-b-2 shadow border-black border-r-2"
          >
            Add Task
          </button>
        </form>
        <button
          className="hover:font-black mx-12 mt-6 hover:bg-green-500 rounded p-1 uppercase font-bold text-sm bg-green-300 mb-2 px-2 border-b-2 shadow border-black
                  border-r-2"
          onClick={() => generateSummary()}
        >
          Summarize
        </button>
        <div className=" text-align p-4 border border-black bg-gray-300 rounded-md mx-12 shadow-lg font-medium">
          <p>
            {summary}
          </p>
        </div>
        <h2 className="font-bold mx-12 mt-10 uppercase text-m">Tasks</h2>
        {taskList && taskList.length > 0 ? (
          <ul className='space-y-6'>
            {taskList.map((task) => (
              <li className="mx-12" key={task.id}>
                <div className='flex mt-2'>
                  <p className='font-medium '>
                    Added : <strong>{task.created_at.split("T")[0]}</strong>
                  </p>
                  <button
                    className=" hover:font-black hover:bg-red-700 text-white px-2 py-1 rounded ml-4 bg-red-500 uppercase font-bold text-xs"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
                <p className=' rounded uppercase font-bold text-sm mb-2 mt-4 px-2 border-l border-b py-1 shadow border-black bg-gray-100'>{task.task.name}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-12 mt-16">No tasks added yet</div>
        )}
      </div>
      <div className="float-right bg-sky-100 bg-opacity-50 w-1/2 shadow border border-gray-200">
        <h2 className="font-bold mx-12 mt-10">Upcoming Tasks</h2>
        {storedTasks && storedTasks.length > 0 ? (
          <ul>
            {storedTasks.map((task) => (
              <li className="mx-12 my-16" key={task.id}>
                Time Added : {moment(task.created_at).fromNow()} {/* Display time of 7 days */}
                <br />
                <div className="mt-5 border-2 p-5 flex-auto">
                  <strong>{task.task.name}</strong>
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