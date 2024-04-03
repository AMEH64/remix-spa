import {
  FormProvider,
  getFieldsetProps,
  getFormProps,
  getInputProps,
  useField,
  useForm,
} from "@conform-to/react";
import { z } from "zod";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  ClientActionFunctionArgs,
  Form,
  redirect,
  useLocation,
  useParams,
} from "@remix-run/react";
import invariant from "tiny-invariant";

const schema = z.object({
  input: z.string().min(1).max(25),
});

function InputField() {
  const [meta, form] = useField("input");

  return (
    <fieldset {...getFieldsetProps(meta)}>
      <legend>Form ID: {form.id}</legend>
      <label htmlFor={meta.id}>Enter some text...</label>
      <input {...getInputProps(meta, { type: "text" })} />
    </fieldset>
  );
}

export async function clientAction({
  params,
  request,
}: ClientActionFunctionArgs) {
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  invariant(params.id, "missing id param");

  return redirect(`/conform/${+params.id + 1}`);
}

export default function Conform() {
  const location = useLocation();
  const params = useParams();
  const [form, fields] = useForm({
    id: `form-${params.id}`,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    constraint: getZodConstraint(schema),
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  });

  return (
    <FormProvider context={form.context}>
      <h1>Location: {location.pathname}</h1>
      <h2>Form ID: {form.id}</h2>
      <Form method="POST" {...getFormProps(form)}>
        <InputField />
        <button type="submit" name="intent" value="save">
          Submit
        </button>
      </Form>
    </FormProvider>
  );
}
