export const creteThreadUseCase = async () => {
  try {
    const resp = await fetch(
      `${import.meta.env.VITE_ASSISTANT_API}/created-thread`,
      {
        method: "POST",
      }
    );

    const { id } = (await resp.json()) as { id: string };

    return id;
  } catch (error) {
    console.log(error);
    throw new Error("Error creating thread");
  }
};
