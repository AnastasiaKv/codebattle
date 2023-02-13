defmodule CodebattleWeb.UserSocket do
  use Phoenix.Socket

  require Logger
  alias Codebattle.User
  ## Channels
  channel("lobby", CodebattleWeb.LobbyChannel)
  channel("tournament:*", CodebattleWeb.TournamentChannel)
  channel("game:*", CodebattleWeb.GameChannel)
  channel("chat:*", CodebattleWeb.ChatChannel)
  channel("main", CodebattleWeb.MainChannel)

  def connect(%{"token" => user_token}, socket) do
    guest_id = User.guest_id()

    case Phoenix.Token.verify(socket, "user_token", user_token, max_age: 1_000_000) do
      {:ok, ^guest_id} ->
        {:ok, assign(socket, current_user: User.create_guest())}

      {:ok, user_id} ->
        {:ok, assign(socket, :current_user, User.get_user!(user_id))}

      {:error, _reason} ->
        :error
    end
  end

  def id(_socket), do: nil
end